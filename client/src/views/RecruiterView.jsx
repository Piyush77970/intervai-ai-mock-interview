import React, { useState, useEffect } from 'react';
import { Users2, Briefcase, Plus, CheckCircle, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';

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

export default function RecruiterView({ theme, setTheme, token, user, onNavigate }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Job posting states
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [type, setType] = useState('technical');

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/recruiter/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [token]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDesc,
          template_settings: { difficulty, type }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create job template');

      setSuccess('Job description template posted successfully!');
      setJobTitle('');
      setJobDesc('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <h1 className="page-title" style={{ marginTop: '8px' }}>Recruiter Dashboard</h1>
          <p className="page-subtitle">Hiring Organization: Google Inc.</p>
        </div>
        <ThemeSelector theme={theme} setTheme={setTheme} />
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', borderRadius: '8px', padding: '12px 18px', marginBottom: '24px', textTransform: 'none', display: 'flex', gap: '10px' }}>
          <AlertCircle size={16} />
          <span><strong>System Error:</strong> {error}</span>
        </div>
      )}
      {success && (
        <div className="badge badge-success" style={{ width: '100%', borderRadius: '8px', padding: '12px 18px', marginBottom: '24px', textTransform: 'none', display: 'flex', gap: '10px' }}>
          <CheckCircle size={16} />
          <span><strong>Success:</strong> {success}</span>
        </div>
      )}

      <div className="grid-cols-3">
        {/* Post new Job Template specs */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} /> Post Job template
          </h3>
          
          <form onSubmit={handlePostJob}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="E.g., Senior Java Developer" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Settings</label>
              <select className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="technical">Technical Expert</option>
                <option value="behavioral">Behavioral Fits</option>
                <option value="hr">HR questions</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills & description</label>
              <textarea 
                className="form-control" 
                rows="6" 
                placeholder="Specify core credentials required..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }} disabled={loading}>
              <Plus size={16} /> Create Job Posting
            </button>
          </form>
        </div>

        {/* Candidate Evaluation scoreboard */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users2 size={20} /> Candidate Evaluator Sheets
          </h3>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Role Applied</th>
                  <th>Topic Checked</th>
                  <th>Overall Score</th>
                  <th>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>{cand.name}</td>
                    <td>{cand.role}</td>
                    <td><span className="badge badge-info">{cand.type}</span></td>
                    <td style={{ fontWeight: 700 }}>{cand.overall_score}%</td>
                    <td>{new Date(cand.interview_date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      No completed candidate interview scorecards seen for this organization yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
