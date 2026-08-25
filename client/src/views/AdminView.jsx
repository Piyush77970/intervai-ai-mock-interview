import React, { useState, useEffect } from 'react';
import { Shield, Users, History, CreditCard, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';

function ThemeSelector({ theme, setTheme }) {
  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value)}
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-color)',
        color: 'var(--dark-navy)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        paddingRight: '28px',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '16px'
      }}
    >
      <option value="light">☀️ Light</option>
      <option value="dark">🌙 Dark</option>
      <option value="system">💻 System</option>
    </select>
  );
}

export default function AdminView({ theme, setTheme, token, onNavigate, onRoleChanged }) {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticsRes = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setMetrics(data.metrics);
      }
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRoleToggle = async (userId, currentRole) => {
    // Cycles candidate -> recruiter -> admin -> candidate
    const rolesCycle = {
      'candidate': 'recruiter',
      'recruiter': 'admin',
      'admin': 'candidate'
    };
    const nextRole = rolesCycle[currentRole] || 'candidate';

    setUpdatingRoleUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (res.ok) {
        // Reload list
        fetchAdminData();
        // If this is the current logged-in user, notify parent
        onRoleChanged(userId, nextRole);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={14} /> Back to candidate view
          </span>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview & role override controls</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeSelector theme={theme} setTheme={setTheme} />
          <button onClick={fetchAdminData} className="btn btn-secondary" disabled={loading} style={{ margin: 0 }}>
            <RefreshCw size={14} /> Reload Analytics
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Quick Metrics Grid */}
          <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
            <div className="card stat-card">
              <div className="stat-icon-wrapper"><Users size={20} /></div>
              <div className="stat-info">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{metrics.total_users}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper"><History size={20} /></div>
              <div className="stat-info">
                <span className="stat-label">Completed Practice</span>
                <span className="stat-value">{metrics.completed_interviews}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper"><CreditCard size={20} /></div>
              <div className="stat-info">
                <span className="stat-label">MRR (Recurring)</span>
                <span className="stat-value">₹{metrics.mrr}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper"><Shield size={20} /></div>
              <div className="stat-info">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">₹{metrics.total_revenue}</span>
              </div>
            </div>
          </div>

          {/* User management panel */}
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>User Directory & Testing Role Switcher</h3>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '20px' }}>
              💡 Use the <strong>"Toggle Test Role"</strong> button to swap roles instantly. This allows you to inspect candidate, recruiter, and admin portals for the same user session out-of-the-box.
            </p>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Subscribed Plan</th>
                    <th>Active Role</th>
                    <th>Test Switch Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-info">{u.plan_name || 'Free'}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'recruiter' ? 'badge-warning' : 'badge-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleRoleToggle(u.id, u.role)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          disabled={updatingRoleUserId === u.id}
                        >
                          <RefreshCw size={12} /> Toggle Test Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
