import React, { useState } from 'react';

export default function AuthView({ initialMode = 'login', onAuthSuccess, onNavigate }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredRole, setPreferredRole] = useState('Java Developer');
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password }
      : { name, email, password, preferred_role: preferredRole, education, experience_years: Number(experienceYears) };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="logo-container" style={{ justifyContent: 'center', paddingBottom: '16px' }}>
            <span className="logo-text" style={{ cursor: 'pointer' }} onClick={() => onNavigate('landing')}>IntervAI<span className="logo-dot">.</span></span>
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Enter your credentials to access mock interviews' 
              : 'Join over 10,000+ candidates building career confidence'}
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', textTransform: 'none', display: 'block' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Preferred Career Role</label>
                <select 
                  className="form-control"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Education</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="B.Tech CS / MCA" 
                    value={education} 
                    onChange={(e) => setEducation(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Exp (Years)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="0" 
                    max="40" 
                    value={experienceYears} 
                    onChange={(e) => setExperienceYears(e.target.value)} 
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', height: '44px' }}
            disabled={loading}
          >
            {loading ? 'Processing authentication...' : mode === 'login' ? 'Log in' : 'Create free account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--secondary-text)' }}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); setError(''); }}>
                Register here
              </a>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>
                Log in here
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
