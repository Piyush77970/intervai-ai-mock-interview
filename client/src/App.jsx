import React, { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import CandidateView from './views/CandidateView';
import RecruiterView from './views/RecruiterView';
import AdminView from './views/AdminView';

function App() {
  const [view, setView] = useState('landing');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (t) => {
      root.classList.remove('dark');
      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) {
          root.classList.add('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        root.classList.remove('dark');
        if (e.matches) root.classList.add('dark');
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    // If token exists, load user profile to verify role
    if (token) {
      fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Session expired');
          }
          return res.json();
        })
        .then(data => {
          setUser({
            id: data.user_id,
            name: data.name,
            email: data.email,
            role: data.role
          });
          setView('dashboard');
        })
        .catch(err => {
          console.warn(err.message);
          handleLogout();
        });
    }
  }, [token]);

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setView('landing');
  };

  const handleRoleChanged = (userId, newRole) => {
    if (user && user.id === userId) {
      // Update local role
      setUser(prev => {
        const updated = { ...prev, role: newRole };
        return updated;
      });
      // Redirect based on new role
      if (newRole === 'admin') setView('admin');
      else if (newRole === 'recruiter') setView('recruiter');
      else setView('dashboard');
    }
  };

  // Basic route mapping
  return (
    <>
      {view === 'landing' && (
        <LandingView 
          theme={theme}
          setTheme={setTheme}
          onNavigate={setView} 
          isAuthenticated={!!token} 
        />
      )}

      {(view === 'login' || view === 'register') && (
        <AuthView 
          initialMode={view} 
          onAuthSuccess={handleAuthSuccess} 
          onNavigate={setView} 
        />
      )}

      {view === 'dashboard' && token && user && (
        <CandidateView 
          theme={theme}
          setTheme={setTheme}
          token={token} 
          user={user} 
          onLogout={handleLogout} 
          onNavigate={setView} 
        />
      )}

      {view === 'recruiter' && token && user && user.role === 'recruiter' && (
        <RecruiterView 
          theme={theme}
          setTheme={setTheme}
          token={token} 
          user={user} 
          onNavigate={setView} 
        />
      )}

      {view === 'admin' && token && user && user.role === 'admin' && (
        <AdminView 
          theme={theme}
          setTheme={setTheme}
          token={token} 
          onNavigate={setView} 
          onRoleChanged={handleRoleChanged} 
        />
      )}
    </>
  );
}

export default App;
