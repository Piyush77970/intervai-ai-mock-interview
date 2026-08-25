import React, { useState } from 'react';
import { Play, Check, ChevronDown, Award, Mic, Code, ShieldCheck, TrendingUp, Users2, HelpCircle } from 'lucide-react';

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

export default function LandingView({ theme, setTheme, onNavigate, isAuthenticated }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleBilling = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-layout">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="logo-container" style={{ paddingBottom: 0 }}>
            <span className="logo-text">IntervAI<span className="logo-dot">.</span></span>
          </div>
          
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How It Works</a>
            <a href="#pricing" className="landing-nav-link">Pricing</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>
          </div>

          <div className="landing-nav-actions">
            <ThemeSelector theme={theme} setTheme={setTheme} />
            {isAuthenticated ? (
              <button onClick={() => onNavigate('dashboard')} className="btn btn-primary">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('login')} className="btn btn-secondary">Log in</button>
                <button onClick={() => onNavigate('register')} className="btn btn-primary">Start Interview</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-container">
          <h1 className="hero-heading">Practice for your next interview.</h1>
          <p className="hero-subtitle">
            Realistic mock interviews with feedback that helps you improve. Tailored questions, instant evaluations, and custom roadmaps.
          </p>
          <div className="hero-actions">
            <button 
              onClick={() => onNavigate(isAuthenticated ? 'setup' : 'register')} 
              className="btn btn-primary"
            >
              Start a mock interview
            </button>
            <a href="#how-it-works" className="btn btn-secondary">
              See how it works
            </a>
          </div>
          <div className="hero-social-proof">
            <span>⭐️ <strong>4.9/5</strong> rating from candidates</span>
            <span>•</span>
            <span><strong>10,000+</strong> interviews practiced</span>
          </div>
        </div>
      </header>

      {/* Hero Visual Mockup */}
      <div className="preview-card-container">
        <div className="card interview-preview-card">
          <div className="preview-header">
            <div>
              <h4 style={{ fontSize: '15px' }}>Mock Interview Room</h4>
              <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Java Developer Role</span>
            </div>
            <span className="badge badge-info">Question 3 of 10</span>
          </div>
          <div className="preview-question-box">
            "Tell me about a challenging project you worked on and how you resolved the technical blockages."
          </div>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-text)' }}>Candidate Audio Answer:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={16} />
              </div>
              <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', backgroundColor: 'var(--primary-blue)', borderRadius: '3px' }}></div>
              </div>
              <span className="preview-timer">02:14</span>
            </div>
          </div>
          <div className="preview-controls">
            <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }} disabled>Replay Audio</button>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }} disabled>Submit Answer</button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="section-title">How IntervAI Works</h2>
        <p className="section-subtitle">A straightforward loop to sharpen your communication and technical competency.</p>
        
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <h4 className="step-title">Choose your interview</h4>
            <p className="step-desc">Select role types (Java, Python, HR), difficulty levels, duration, and text/voice practice modes.</p>
          </div>
          <div className="step-card">
            <span className="step-number">02</span>
            <h4 className="step-title">Start practicing</h4>
            <p className="step-desc">Answer questions in real-time. Record voice clips or enter structured text answers.</p>
          </div>
          <div className="step-card">
            <span className="step-number">03</span>
            <h4 className="step-title">Get AI feedback</h4>
            <p className="step-desc">Receive immediate score reports detailing correctness, STAR structures, and missing items.</p>
          </div>
          <div className="step-card">
            <span className="step-number">04</span>
            <h4 className="step-title">Improve your gap</h4>
            <p className="step-desc">Follow a personalized weekly study roadmap generated based on your weaknesses.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <h2 className="section-title">Features Built for Success</h2>
        <p className="section-subtitle">Everything you need to land your next technical or leadership role.</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box"><Play size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">AI Mock Interviews</h4>
              <p className="feature-desc">Practice realistic interviews tailored to your target job, from Fresher to Expert.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box"><Award size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">Resume-Based Interviews</h4>
              <p className="feature-desc">Upload your resume to receive personalized questions matching your actual experience.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box"><ShieldCheck size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">Job-Specific Matches</h4>
              <p className="feature-desc">Paste target job descriptions to calculate ATS compatibility matches and custom questions.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box"><Mic size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">Voice & Video Mode</h4>
              <p className="feature-desc">Speak naturally with voice-recording and audio-transcribing capabilities built in.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box"><Code size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">Coding Room</h4>
              <p className="feature-desc">Integrated code sandbox to write solution logic, execute test cases, and analyze complexities.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box"><TrendingUp size={20} /></div>
            <div className="feature-info">
              <h4 className="feature-title">Progress Metrics</h4>
              <p className="feature-desc">Track scores over time, study week-by-week roadmaps, and chat with your AI Career Coach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="section-title">Transparent Pricing</h2>
        <p className="section-subtitle">Choose a plan that fits your career preparation timeline.</p>

        <div className="pricing-toggle-container">
          <span className={`toggle-label ${billingCycle === 'monthly' ? 'active' : ''}`} onClick={() => setBillingCycle('monthly')}>Monthly</span>
          <div className={`toggle-switch ${billingCycle === 'yearly' ? 'active' : ''}`} onClick={toggleBilling}>
            <div className="toggle-handle"></div>
          </div>
          <span className={`toggle-label ${billingCycle === 'yearly' ? 'active' : ''}`} onClick={() => setBillingCycle('yearly')}>
            Yearly <span style={{ color: 'var(--success-color)', fontSize: '11px', fontWeight: 700 }}>(Save 20%)</span>
          </span>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <div className="card pricing-card">
            <div className="price-header">
              <span className="plan-name">Free</span>
              <div className="plan-price">₹0<span>/month</span></div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', minHeight: '38px' }}>Test core features with basic questions.</p>
            <ul className="price-features">
              <li className="checked">3 interviews/month</li>
              <li className="checked">Text interviews</li>
              <li className="checked">Basic feedback report</li>
              <li className="checked">Basic dashboard</li>
              <li className="unchecked">Voice & Video mode</li>
              <li className="unchecked">Coding challenge room</li>
            </ul>
            <button onClick={() => onNavigate('register')} className="btn btn-secondary" style={{ width: '100%' }}>Get started</button>
          </div>

          {/* Student */}
          <div className="card pricing-card">
            <div className="price-header">
              <span className="plan-name">Student</span>
              <div className="plan-price">₹{billingCycle === 'monthly' ? '149' : '119'}<span>/month</span></div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', minHeight: '38px' }}>Ideal for college grads and entry levels.</p>
            <ul className="price-features">
              <li className="checked">10 interviews/month</li>
              <li className="checked">Voice interviews</li>
              <li className="checked">Resume ATS analysis</li>
              <li className="checked">Basic coding tests</li>
              <li className="checked">Learning roadmap</li>
              <li className="unchecked">Video & Job matches</li>
            </ul>
            <button onClick={() => onNavigate('register')} className="btn btn-secondary" style={{ width: '100%' }}>Start Student Plan</button>
          </div>

          {/* Pro */}
          <div className="card pricing-card popular">
            <span className="popular-badge">Most popular</span>
            <div className="price-header">
              <span className="plan-name" style={{ color: 'var(--primary-blue)' }}>Pro</span>
              <div className="plan-price">₹{billingCycle === 'monthly' ? '299' : '239'}<span>/month</span></div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', minHeight: '38px' }}>Full prep suite for experienced roles.</p>
            <ul className="price-features">
              <li className="checked">Unlimited interviews</li>
              <li className="checked">Voice interviews</li>
              <li className="checked">Resume & Job description</li>
              <li className="checked">Full Coding room access</li>
              <li className="checked">AI Career Coach chat</li>
              <li className="checked">Advanced analytics</li>
            </ul>
            <button onClick={() => onNavigate('register')} className="btn btn-primary" style={{ width: '100%' }}>Start Pro</button>
          </div>

          {/* Premium */}
          <div className="card pricing-card">
            <div className="price-header">
              <span className="plan-name">Premium</span>
              <div className="plan-price">₹{billingCycle === 'monthly' ? '599' : '479'}<span>/month</span></div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)', minHeight: '38px' }}>Deep analytical review for leadership.</p>
            <ul className="price-features">
              <li className="checked">Everything in Pro</li>
              <li className="checked">Video interviews</li>
              <li className="checked">Filler-words counts</li>
              <li className="checked">Unlimited coding sandbox</li>
              <li className="checked">Interview audio replay</li>
              <li className="checked">Priority AI models</li>
            </ul>
            <button onClick={() => onNavigate('register')} className="btn btn-secondary" style={{ width: '100%' }}>Go Premium</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section" style={{ paddingBottom: '120px' }}>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Answers to common inquiries about our mock evaluation features.</p>

        <div className="faq-grid">
          {[
            {
              q: "Does IntervAI require a microphone or camera?",
              a: "Only if you select Voice or Video interview modes. For standard Practice, you can use the Text mode which utilizes a clean editor. If you choose Voice, we will request standard browser microphone permission to record your responses."
            },
            {
              q: "Can I upload a customized resume to generate questions?",
              a: "Yes. In the Resume Analyzer section, you can drag and drop PDF, DOCX, or text files. The AI extracts your listed skills, calculates compatibility ratings, and allows you to boot a practice session designed around your actual projects."
            },
            {
              q: "How does the coding interview compiler simulator work?",
              a: "Our coding editor features starter code in JavaScript, Python, C++, and Java. When you click 'Run Code', it executes logic checks and hidden test cases, returning details on failed nodes and runtime/space efficiencies (e.g. O(n) complexity)."
            },
            {
              q: "Can I Switch between Monthly and Yearly billing?",
              a: "Absolutely. You can change billing cycles or downgrade your paid plan at any time inside the Subscription tab. You will retain access to Pro/Premium features until the current paid period ends."
            }
          ].map((item, idx) => (
            <div className="card faq-card" key={idx} onClick={() => toggleFaq(idx)}>
              <div className="faq-question">
                <span>{item.q}</span>
                <ChevronDown 
                  size={18} 
                  style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} 
                />
              </div>
              {activeFaq === idx && (
                <p className="faq-answer">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--dark-navy)', color: '#FFFFFF', padding: '40px 20px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>IntervAI<span className="logo-dot">.</span></div>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Practice for your next interview. Realistic mock interviews with feedback that helps you improve.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', color: '#94a3b8' }}>
            <a href="#" style={{ color: '#94a3b8' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#94a3b8' }}>Terms of Service</a>
            <a href="#" style={{ color: '#94a3b8' }}>AI Disclosure</a>
            <a href="#" style={{ color: '#94a3b8' }}>Support</a>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>&copy; 2026 IntervAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
