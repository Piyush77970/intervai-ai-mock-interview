import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, User, FileText, Play, History, Map, MessageSquare, 
  CreditCard, LogOut, Award, Star, BookOpen, AlertCircle, CheckCircle, 
  TrendingUp, Clock, Mic, Video, Code, ShieldCheck, ChevronRight, Download, Send, Plus
} from 'lucide-react';

function ThemeSelector({ theme, setTheme }) {
  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
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
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '16px',
        marginBottom: '10px'
      }}
    >
      <option value="light">☀️ Light</option>
      <option value="dark">🌙 Dark</option>
      <option value="system">💻 System</option>
    </select>
  );
}

export default function CandidateView({ theme, setTheme, token, user, onLogout, onNavigate }) {
  const [subView, setSubView] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  
  // Shared state loaders
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Dashboard State
  const [historyList, setHistoryList] = useState([]);
  
  // 2. Profile State
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [location, setLocation] = useState('');
  const [careerGoals, setCareerGoals] = useState('');

  // 3. Resume Analyzer State
  const [resumeData, setResumeData] = useState({ resume: null, analysis: null });
  const [uploadingResume, setUploadingResume] = useState(false);
  
  // 4. Job Matcher State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobText, setJobText] = useState('');
  const [jobMatchResult, setJobMatchResult] = useState(null);

  // 5. Interview Setup State
  const [setupRole, setSetupRole] = useState('Java Developer');
  const [setupExp, setSetupExp] = useState('1-3 years');
  const [setupType, setSetupType] = useState('technical');
  const [setupDifficulty, setSetupDifficulty] = useState('medium');
  const [setupMode, setSetupMode] = useState('text');
  const [setupDuration, setSetupDuration] = useState(15);

  // 6. Interview Room State
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const recordTimerRef = useRef(null);
  const videoRef = useRef(null);

  // 7. Coding Challenge State
  const [codingChallenges, setCodingChallenges] = useState([]);
  const [activeCodingChallenge, setActiveCodingChallenge] = useState(null);
  const [codeContent, setCodeContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codingSubmissionResult, setCodingSubmissionResult] = useState(null);

  // 8. Results / Scorecard state
  const [resultsReport, setResultsReport] = useState(null);

  // 9. Roadmap state
  const [roadmapWeeks, setRoadmapWeeks] = useState([]);

  // 10. AI Career Coach state
  const [coachMessages, setCoachMessages] = useState([
    { sender: 'ai', text: "Hello! I am IntervAI Coach. I can help you review technical concepts, structure STAR answers, or plan study roadmaps. Ask me anything!" }
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [coachSending, setCoachSending] = useState(false);

  // 11. Billing state
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [invoices, setInvoices] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Load all initial stats and profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEducation(data.education || '');
        setExperienceYears(data.experience_years || 0);
        setPreferredRole(data.preferred_role || '');
        setSkillsText(Array.isArray(data.skills) ? data.skills.join(', ') : '');
        setLocation(data.location || '');
        setCareerGoals(data.career_goals || '');
      }
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/interviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistoryList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResume = async () => {
    try {
      const res = await fetch('/api/resume', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setResumeData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pData = await res.json();
      if (res.ok && pData) {
        // Mock weekly roadmaps based on weakness topics seeded in db
        const roadmapRes = await fetch('/api/payments/history', { // Using any valid endpoint or mock
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Generate mock steps
        setRoadmapWeeks([
          { week: 1, topic: 'JVM Memory Architecture', action: 'Study GC Eden vs Tenured spaces. Practice explaining object lifecycles.', status: 'completed' },
          { week: 2, topic: 'HashMap Hash Collisions', action: 'Review TreeNode implementations in Java 8 and collision resolutions.', status: 'ongoing' },
          { week: 3, topic: 'Concurrencies & ExecutorService', action: 'Build synchronized queues. Analyze ReentrantLocks usage.', status: 'pending' },
          { week: 4, topic: 'STAR communication style', action: 'Complete a behavioral mock session. Quantify final results.', status: 'pending' }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBillingData = async () => {
    try {
      const plansRes = await fetch('/api/payments/plans');
      const subRes = await fetch('/api/payments/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const invRes = await fetch('/api/payments/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payRes = await fetch('/api/payments/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (plansRes.ok) setPlans(await plansRes.json());
      if (subRes.ok) setCurrentSub(await subRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (payRes.ok) setPaymentHistory(await payRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCodingChallenges = async () => {
    try {
      const res = await fetch('/api/coding/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCodingChallenges(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, [token]);

  useEffect(() => {
    if (subView === 'dashboard') {
      fetchHistory();
      fetchProfile();
    } else if (subView === 'resume') {
      fetchResume();
    } else if (subView === 'coding') {
      fetchCodingChallenges();
    } else if (subView === 'roadmap') {
      fetchRoadmap();
    } else if (subView === 'billing') {
      fetchBillingData();
    }
  }, [subView]);

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          education,
          experience_years: Number(experienceYears),
          preferred_role: preferredRole,
          skills: skillsArray,
          location,
          career_goals
        })
      });

      if (!res.ok) throw new Error('Failed to update profile information');

      setSuccess('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resume Upload & Analysis
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadingResume(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload resume file');

      // Now analyze immediately
      const analyzeRes = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Failed to analyze resume');

      setSuccess('Resume analyzed successfully!');
      fetchResume();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingResume(false);
    }
  };

  // Job Description Matcher
  const handleJobMatchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setJobMatchResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_title: jobTitle,
          company: jobCompany,
          raw_text: jobText
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze job matches');

      setJobMatchResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Interview from Job description
  const handleCreateInterviewFromJob = () => {
    if (!jobMatchResult) return;
    setSetupRole(jobMatchResult.job_title);
    setSetupType('technical');
    setSetupMode('text');
    setSubView('setup');
  };

  // Interview Setup Wizard submit -> starts room
  const handleStartSetupInterview = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: setupRole,
          experience_level: setupExp,
          type: setupType,
          difficulty: setupDifficulty,
          duration_minutes: setupDuration,
          mode: setupMode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate interview questions');

      setActiveInterview(data);
      setCurrentQuestionIndex(0);
      setAnswerText('');
      setRecordedTranscript('');
      setSubView('room');

      // If mode is video, request camera permissions
      if (setupMode === 'video') {
        requestCameraAccess();
      }
    } catch (err) {
      setError(err.message);
      setSubView('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const requestCameraAccess = async () => {
    try {
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
              if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(e => {
              console.warn('Camera blocked or unavailable:', e);
            });
        }
      }, 500);
    } catch (e) {
      console.warn('Camera failed to start:', e);
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Voice recording simulators
  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setRecordedTranscript('');
    recordTimerRef.current = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
    
    // Simulate Speech to Text transcription based on selected question concepts
    const activeQ = activeInterview.questions[currentQuestionIndex];
    let simText = `Regarding the question about ${activeQ.question_text.toLowerCase()}, in my experience, the core implementations require configuring standard parameters. `;
    if (setupRole.includes('Java')) {
      simText += "Interface allows multiple inheritance methods using default modifiers, whereas an abstract class maintains internal state variables. I've designed these to structure modular frameworks.";
    } else {
      simText += "I believe managing complexity requires using optimized layouts, checking runtime space requirements, and profiling performance bugs.";
    }
    
    setRecordedTranscript(simText);
    setAnswerText(simText);
  };

  // Submit single answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setError('');
    setEvaluatingAnswer(true);

    const question = activeInterview.questions[currentQuestionIndex];

    try {
      const res = await fetch(`/api/interviews/${activeInterview.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: question.id,
          answer_text: answerText,
          duration_seconds: recordSeconds || 30
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      // Success -> move to next or complete
      if (currentQuestionIndex + 1 < activeInterview.questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswerText('');
        setRecordedTranscript('');
        setRecordSeconds(0);
      } else {
        // Complete the entire interview
        handleCompleteInterview();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  // Complete entire interview session
  const handleCompleteInterview = async () => {
    setError('');
    setEvaluatingAnswer(true);
    stopCamera();

    try {
      const res = await fetch(`/api/interviews/${activeInterview.id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete interview');

      // Fetch results details
      const detailsRes = await fetch(`/api/interviews/${activeInterview.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const detailsData = await detailsRes.json();

      setResultsReport(detailsData);
      setSubView('results');
      setActiveInterview(null);
    } catch (err) {
      setError(err.message);
      setSubView('dashboard');
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  // Open Results Report from History list
  const handleOpenResults = async (interviewId) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load report scorecard');

      setResultsReport(data);
      setSubView('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Coding Challenge Editor start
  const handleStartCodingChallenge = async (challengeId) => {
    setError('');
    setLoading(true);
    setCodingSubmissionResult(null);

    try {
      const res = await fetch(`/api/coding/questions/${challengeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load challenge specifications');

      setActiveCodingChallenge(data);
      setCodeContent(data.starter_code.javascript || '');
      setSelectedLanguage('javascript');
      setSubView('coding-room');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change compiler starter code
  const handleLangChange = (lang) => {
    setSelectedLanguage(lang);
    if (activeCodingChallenge && activeCodingChallenge.starter_code) {
      setCodeContent(activeCodingChallenge.starter_code[lang] || '');
    }
  };

  // Submit coding challenge solution
  const handleSubmitCodingSolution = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/coding/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coding_question_id: activeCodingChallenge.id,
          code: codeContent,
          language: selectedLanguage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setCodingSubmissionResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // AI Career Coach send message
  const handleCoachSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!coachInput.trim()) return;

    setError('');
    const userMsg = { sender: 'user', text: coachInput };
    setCoachMessages(prev => [...prev, userMsg]);
    const promptToSend = coachInput;
    setCoachInput('');
    setCoachSending(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: promptToSend })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get coach reply');

      setCoachMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setCoachMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I am facing connectivity issues at the moment. Please try again." }]);
    } finally {
      setCoachSending(false);
    }
  };

  // Quick Prompt buttons helper
  const handleQuickPrompt = (promptText) => {
    setCoachInput(promptText);
    setTimeout(() => {
      // Simulate submission
      const button = document.getElementById('coach-submit-btn');
      if (button) button.click();
    }, 100);
  };

  // Billing subscriptions upgrades checkout
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: checkoutPlanId,
          billing_cycle: 'monthly',
          coupon_code: couponCode,
          payment_method: paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout transaction failed');

      setSuccess('Subscription upgraded successfully!');
      setCheckoutPlanId(null);
      setCouponCode('');
      fetchBillingData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your paid subscription auto-renewal?")) return;
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/payments/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription renewal');

      setSuccess('Subscription renewal cancelled.');
      fetchBillingData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-text" style={{ cursor: 'pointer' }} onClick={() => setSubView('dashboard')}>
            IntervAI<span className="logo-dot">.</span>
          </span>
        </div>

        <nav className="nav-group">
          <a href="#" className={`nav-link ${subView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('dashboard'); }}>
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a href="#" className={`nav-link ${subView === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('profile'); }}>
            <User size={18} />
            My Profile
          </a>
          <a href="#" className={`nav-link ${subView === 'resume' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('resume'); }}>
            <FileText size={18} />
            Resume Analyzer
          </a>
          <a href="#" className={`nav-link ${subView === 'setup' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('setup'); }}>
            <Play size={18} />
            Start Interview
          </a>
          <a href="#" className={`nav-link ${subView === 'coding' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('coding'); }}>
            <Code size={18} />
            Coding Practice
          </a>
          <a href="#" className={`nav-link ${subView === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('history'); }}>
            <History size={18} />
            History Reports
          </a>
          <a href="#" className={`nav-link ${subView === 'roadmap' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('roadmap'); }}>
            <Map size={18} />
            Learning Roadmap
          </a>
          <a href="#" className={`nav-link ${subView === 'coach' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('coach'); }}>
            <MessageSquare size={18} />
            AI Career Coach
          </a>
          <a href="#" className={`nav-link ${subView === 'billing' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('billing'); }}>
            <CreditCard size={18} />
            Billing & Plans
          </a>
        </nav>

        <div className="sidebar-footer">
          <ThemeSelector theme={theme} setTheme={setTheme} />
          {user && user.role === 'admin' && (
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }} onClick={() => onNavigate('admin')}>
              Go to Admin Panel
            </button>
          )}
          {user && user.role === 'recruiter' && (
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }} onClick={() => onNavigate('recruiter')}>
              Go to Recruiter Panel
            </button>
          )}
          <div className="user-badge">
            <div className="user-avatar">
              {profile ? profile.name.charAt(0) : user.name.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{profile ? profile.name : user.name}</span>
              <span className="user-role">{profile ? `Level ${profile.level}` : user.role}</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--error-color)', borderColor: 'rgba(197, 48, 48, 0.2)' }}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Global Notifications banners */}
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

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Candidate Dashboard */}
        {/* ---------------------------------------------------- */}
        {subView === 'dashboard' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Good morning, {profile ? profile.name.split(' ')[0] : user.name.split(' ')[0]}!</h1>
                <p className="page-subtitle">Ready for your next mock interview session today?</p>
              </div>
              <button onClick={() => setSubView('setup')} className="btn btn-primary">
                <Play size={16} fill="white" />
                Start Interview
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
              <div className="card stat-card">
                <div className="stat-icon-wrapper"><History size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Total Practice</span>
                  <span className="stat-value">{historyList.length}</span>
                </div>
              </div>
              
              <div className="card stat-card">
                <div className="stat-icon-wrapper"><Award size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Average Score</span>
                  <span className="stat-value">
                    {historyList.length > 0 
                      ? `${(historyList.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / historyList.length).toFixed(1)}%`
                      : '0.0%'}
                  </span>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon-wrapper"><TrendingUp size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Best Score</span>
                  <span className="stat-value">
                    {historyList.length > 0 
                      ? `${Math.max(...historyList.map(h => h.overall_score || 0))}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              <div className="card stat-card">
                <div className="stat-icon-wrapper"><Star size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Streak Days</span>
                  <span className="stat-value">{profile ? profile.streak_days : 0} 🔥</span>
                </div>
              </div>
            </div>

            <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
              {/* Radar Progress bars mock */}
              <div className="card">
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Skill Competency Indexes</h3>
                <div className="radar-container">
                  <div className="radar-row">
                    <span className="radar-label">Technical Depth</span>
                    <div className="radar-track"><div className="radar-fill" style={{ width: '82%' }}></div></div>
                    <span className="radar-value">82</span>
                  </div>
                  <div className="radar-row">
                    <span className="radar-label">Communication Speed</span>
                    <div className="radar-track"><div className="radar-fill" style={{ width: '74%' }}></div></div>
                    <span className="radar-value">74</span>
                  </div>
                  <div className="radar-row">
                    <span className="radar-label">Problem Solving</span>
                    <div className="radar-track"><div className="radar-fill" style={{ width: '85%' }}></div></div>
                    <span className="radar-value">85</span>
                  </div>
                  <div className="radar-row">
                    <span className="radar-label">Answer Relevance</span>
                    <div className="radar-track"><div className="radar-fill" style={{ width: '90%' }}></div></div>
                    <span className="radar-value">90</span>
                  </div>
                </div>
              </div>

              {/* Progress Line chart mock using SVGs */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Performance Trend</h3>
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 10px', position: 'relative' }}>
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                    <path 
                      d="M 20 120 L 120 100 L 220 90 L 320 50" 
                      fill="none" 
                      stroke="var(--primary-blue)" 
                      strokeWidth="3" 
                    />
                    <circle cx="20" cy="120" r="5" fill="var(--primary-blue)" />
                    <circle cx="120" cy="100" r="5" fill="var(--primary-blue)" />
                    <circle cx="220" cy="90" r="5" fill="var(--primary-blue)" />
                    <circle cx="320" cy="50" r="5" fill="var(--primary-blue)" />
                  </svg>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-text)', position: 'absolute', bottom: '-20px', left: '10px' }}>Int-1 (60)</span>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-text)', position: 'absolute', bottom: '-20px', left: '110px' }}>Int-2 (68)</span>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-text)', position: 'absolute', bottom: '-20px', left: '210px' }}>Int-3 (74)</span>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-text)', position: 'absolute', bottom: '-20px', left: '310px' }}>Int-4 (82)</span>
                </div>
              </div>
            </div>

            {/* Recommended weakness actions */}
            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recommended Preparations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600 }}>JVM Garbage Collection Tuning</h5>
                    <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Focus: Explain CMS vs G1GC differences and minor/major sweep details.</p>
                  </div>
                  <button onClick={() => setSubView('coach')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Ask Coach</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600 }}>String In-Place Reversal</h5>
                    <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Focus: Coding challenges solved in-place using O(1) memory space.</p>
                  </div>
                  <button onClick={() => setSubView('coding')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Solve Code</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Profile Edit */}
        {/* ---------------------------------------------------- */}
        {subView === 'profile' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Configure your career credentials to customize AI question generation loops.</p>
              </div>
            </div>

            <div className="card">
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Preferred Career Target Role</label>
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
                    <option value="Data Scientist">Data Scientist</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Highest Degree / Education</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="B.Tech in Computer Science" 
                      value={education} 
                      onChange={(e) => setEducation(e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Total Experience (Years)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={experienceYears} 
                      onChange={(e) => setExperienceYears(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (Comma Separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Java, SQL, Git, HTML/CSS, React" 
                    value={skillsText} 
                    onChange={(e) => setSkillsText(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Bengaluru, India" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Career Goals</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="E.g., Transition into a lead architect role at a SaaS startup." 
                    value={careerGoals} 
                    onChange={(e) => setCareerGoals(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Resume Analyzer */}
        {/* ---------------------------------------------------- */}
        {subView === 'resume' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Resume & Job Analyzer</h1>
                <p className="page-subtitle">Compare your credentials against target job specs using AI parsing diagnostics.</p>
              </div>
            </div>

            <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
              {/* Left Column: Resume Upload */}
              <div className="card">
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Upload Resume</h3>
                
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', marginBottom: '24px' }}>
                  <FileText size={40} style={{ color: 'var(--secondary-text)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Drag & drop your resume file here</p>
                  <p style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '16px' }}>Supports PDF, DOC, DOCX or TXT (Max 10MB)</p>
                  <input 
                    type="file" 
                    id="resume-file-input" 
                    style={{ display: 'none' }} 
                    onChange={handleResumeUpload} 
                  />
                  <button 
                    onClick={() => document.getElementById('resume-file-input').click()} 
                    className="btn btn-secondary"
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? 'Processing PDF analysis...' : 'Browse Files'}
                  </button>
                </div>

                {resumeData.analysis ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700 }}>
                        {resumeData.analysis.overall_score}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px' }}>Latest Resume Score</h4>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          ATS Compatibility Match: {resumeData.analysis.ats_compatibility}%
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Extracted Skills</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {resumeData.analysis.extracted_skills?.map((s, i) => (
                          <span key={i} className="badge badge-info">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Missing Industry Keywords</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {resumeData.analysis.missing_skills?.map((s, i) => (
                          <span key={i} className="badge badge-warning">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Resume Customizations</h5>
                      <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--secondary-text)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {resumeData.analysis.suggestions?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p className="empty-state-title">No resume analyzed yet</p>
                    <p className="empty-state-desc">Upload your resume to get compatibility metrics and customized advice.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Job Description Matcher */}
              <div className="card">
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Paste Job Description</h3>
                
                <form onSubmit={handleJobMatchSubmit}>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="E.g., Java Developer" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="E.g., Google" 
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Description text</label>
                    <textarea 
                      className="form-control" 
                      rows="6" 
                      placeholder="Paste the full job responsibilities and skill requirements here..." 
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Comparing...' : 'Analyze Match'}
                  </button>
                </form>

                {jobMatchResult && (
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '15px' }}>Job compatibility Rating:</h4>
                      <span className={`badge ${jobMatchResult.match_score > 75 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '16px', padding: '6px 12px' }}>
                        {jobMatchResult.match_score}% Match
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Skills Match Checklist</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {jobMatchResult.matched_skills?.map((s, i) => (
                          <span key={i} className="badge badge-success">✓ {s}</span>
                        ))}
                        {jobMatchResult.missing_skills?.map((s, i) => (
                          <span key={i} className="badge badge-danger">✕ {s}</span>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleCreateInterviewFromJob} className="btn btn-success" style={{ width: '100%', marginTop: '12px' }}>
                      Create Practice Interview From This Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Interview Setup Wizard */}
        {/* ---------------------------------------------------- */}
        {subView === 'setup' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Start a Mock Practice</h1>
                <p className="page-subtitle">Configure your target settings to customize your mock interviewer.</p>
              </div>
            </div>

            <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div className="form-group">
                <label className="form-label">Select Interview Role</label>
                <select 
                  className="form-control"
                  value={setupRole}
                  onChange={(e) => setSetupRole(e.target.value)}
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Python Developer">Python Developer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience Tier</label>
                  <select 
                    className="form-control"
                    value={setupExp}
                    onChange={(e) => setSetupExp(e.target.value)}
                  >
                    <option value="Fresher">Fresher (0-1 yr)</option>
                    <option value="1-3 years">Junior (1-3 yrs)</option>
                    <option value="3-5 years">Mid-Level (3-5 yrs)</option>
                    <option value="5+ years">Senior (5+ yrs)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Category</label>
                  <select 
                    className="form-control"
                    value={setupType}
                    onChange={(e) => setSetupType(e.target.value)}
                  >
                    <option value="technical">Technical Expert</option>
                    <option value="behavioral">Behavioral (STAR Method)</option>
                    <option value="hr">HR & Culture Fit</option>
                    <option value="mixed">Mixed General</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select 
                    className="form-control"
                    value={setupDifficulty}
                    onChange={(e) => setSetupDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert / Staff</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Mode</label>
                  <select 
                    className="form-control"
                    value={setupMode}
                    onChange={(e) => setSetupMode(e.target.value)}
                  >
                    <option value="text">Text Response</option>
                    <option value="voice">Simulated Voice Recording</option>
                    <option value="video">Simulated Video Feed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration Limit</label>
                <select 
                  className="form-control"
                  value={setupDuration}
                  onChange={(e) => setSetupDuration(Number(e.target.value))}
                >
                  <option value="5">Short Check (5 mins)</option>
                  <option value="15">Standard (15 mins)</option>
                  <option value="30">Comprehensive (30 mins)</option>
                </select>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button onClick={handleStartSetupInterview} className="btn btn-primary" style={{ width: '100%', height: '46px' }} disabled={loading}>
                  {loading ? 'Initializing AI Interview Engine...' : 'Launch Interview Room'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: AI Interview Room */}
        {/* ---------------------------------------------------- */}
        {subView === 'room' && activeInterview && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">{activeInterview.role} Mock Interview</h1>
                <p className="page-subtitle">Mode: {activeInterview.mode} | Difficulty: {activeInterview.difficulty}</p>
              </div>
              <span className="badge badge-info" style={{ fontSize: '14px', padding: '6px 12px' }}>
                Question {currentQuestionIndex + 1} of {activeInterview.questions.length}
              </span>
            </div>

            <div className="room-container">
              {/* Main Panel */}
              <div className="room-main">
                <div className="card" style={{ borderLeft: '5px solid var(--primary-blue)' }}>
                  <h3 style={{ fontSize: '15px', color: 'var(--primary-blue)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    AI Interviewer Prompt
                  </h3>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--dark-navy)' }}>
                    {activeInterview.questions[currentQuestionIndex]?.question_text}
                  </p>
                </div>

                {/* Camera/Voice preview for Media Modes */}
                {activeInterview.mode !== 'text' && (
                  <div className="grid-cols-2">
                    {/* Simulated Camera display */}
                    {activeInterview.mode === 'video' && (
                      <div className="camera-preview">
                        {cameraActive ? (
                          <video ref={videoRef} autoPlay playsInline muted></video>
                        ) : (
                          <div className="camera-placeholder">
                            <Video size={32} />
                            <span>Camera inactive</span>
                          </div>
                        )}
                        <div className="camera-overlay">
                          <div className="pulse-dot"></div>
                          <span>LIVE FEED</span>
                        </div>
                      </div>
                    )}

                    {/* Microphone recorder preview widget */}
                    <div className="voice-recording-widget">
                      <Mic size={32} style={{ color: isRecording ? 'var(--error-color)' : 'var(--primary-blue)' }} />
                      <div>
                        <h4 style={{ fontSize: '14px' }}>
                          {isRecording ? 'IntervAI is recording your answer...' : 'Microphone Ready'}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          {isRecording ? `Recording duration: ${recordSeconds}s` : 'Click below to begin speaking'}
                        </span>
                      </div>
                      
                      <div className="record-btn-container">
                        {isRecording ? (
                          <button onClick={stopRecording} className="record-btn recording">
                            <Clock size={20} />
                          </button>
                        ) : (
                          <button onClick={startRecording} className="record-btn">
                            <Mic size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Written Answer Submission Box */}
                <div className="card">
                  <label className="form-label">
                    {activeInterview.mode === 'text' 
                      ? 'Type your answer below:' 
                      : 'Speak to record, or customize your transcript answer below:'}
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="6" 
                    placeholder="Enter your professional solution response details..." 
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={evaluatingAnswer}
                  ></textarea>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <button 
                      onClick={handleSubmitAnswer} 
                      className="btn btn-primary"
                      disabled={evaluatingAnswer || !answerText.trim()}
                    >
                      {evaluatingAnswer ? 'AI Evaluating Answer...' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Panel */}
              <div className="room-sidebar">
                <div className="card timer-box">
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Elapsed Time</span>
                  <span className="timer-digits">05:42</span>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Evaluation Rubric</h3>
                  <p style={{ fontSize: '12px', color: 'var(--secondary-text)', marginBottom: '16px' }}>
                    AI expects to hear these core keywords/concepts mentioned in a high-scoring answer:
                  </p>
                  
                  {/* Mock list of expected keywords */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activeInterview.mode === 'video' ? (
                      <>
                        <span className="badge badge-info">STAR method</span>
                        <span className="badge badge-info">Action metrics</span>
                        <span className="badge badge-info">Lessons learned</span>
                      </>
                    ) : (
                      <>
                        <span className="badge badge-info">Interface contract</span>
                        <span className="badge badge-info">Abstract constructor</span>
                        <span className="badge badge-info">State variables</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Interview Tips</h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--secondary-text)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Structure technical definitions clearly before giving real projects examples.</li>
                    <li>For behavioral prompts, use the STAR format (Situation, Task, Action, Result).</li>
                    <li>Avoid rushing; brief pauses before answering show control.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Results report card */}
        {/* ---------------------------------------------------- */}
        {subView === 'results' && resultsReport && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Mock Interview Scorecard</h1>
                <p className="page-subtitle">
                  {resultsReport.interview.role} | Type: {resultsReport.interview.type}
                </p>
              </div>
              <button onClick={() => setSubView('dashboard')} className="btn btn-secondary">
                Back to Dashboard
              </button>
            </div>

            <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
              {/* Large Score Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--secondary-text)', fontWeight: 600 }}>Overall AI Score</span>
                <div style={{ fontSize: '64px', fontWeight: 700, color: 'var(--primary-blue)', margin: '12px 0' }}>
                  {resultsReport.interview.overall_score}
                </div>
                <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '13px' }}>Completed</span>
              </div>

              {/* Aggregated Feedback details */}
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Practice Feedback Summary</h3>
                <p style={{ fontSize: '14px', color: 'var(--main-text)', lineHeight: 1.6 }}>
                  {resultsReport.interview.feedback_summary}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <div>
                    <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--success-color)' }}>What you did well</h5>
                    <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                      Demonstrated solid understanding of technical definitions and addressed prompt topics directly.
                    </p>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--warning-color)' }}>Areas to Improve</h5>
                    <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                      Expand on runtime memory allocations, complexity analyses (Time/Space bounds), and architectural tradeoffs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer logs accordion list */}
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Question by Question Breakdown</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {resultsReport.answers.map((ans, idx) => (
                  <div key={idx} style={{ borderBottom: idx < resultsReport.answers.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Q{idx + 1}: {resultsReport.questions[idx]?.question_text}</h4>
                      <span className="badge badge-info" style={{ fontSize: '12px' }}>Score: {ans.score}/10</span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-text)' }}>Your Answer:</span>
                      <p style={{ fontSize: '13px', color: 'var(--main-text)', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>
                        "{ans.answer_text}"
                      </p>
                    </div>

                    {ans.star_situation && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}>STAR Analysis:</span>
                        <div className="star-grid">
                          <div className="star-card">
                            <div className="star-badge-label">Situation</div>
                            <p>{ans.star_situation}</p>
                          </div>
                          <div className="star-card">
                            <div className="star-badge-label">Task</div>
                            <p>{ans.star_task}</p>
                          </div>
                          <div className="star-card">
                            <div className="star-badge-label">Action</div>
                            <p>{ans.star_action}</p>
                          </div>
                          <div className="star-card">
                            <div className="star-badge-label">Result</div>
                            <p>{ans.star_result}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid-cols-2" style={{ gap: '12px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <strong>Positive Feedback:</strong>
                        <p style={{ color: 'var(--secondary-text)', marginTop: '2px' }}>{ans.feedback_positive}</p>
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <strong>Suggestions:</strong>
                        <p style={{ color: 'var(--secondary-text)', marginTop: '2px' }}>{ans.feedback_improve}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Coding Challenge Practice list */}
        {/* ---------------------------------------------------- */}
        {subView === 'coding' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Coding challenge Room</h1>
                <p className="page-subtitle">Solve algorithmic questions, compile code solutions, and analyze bounds.</p>
              </div>
            </div>

            <div className="grid-cols-3">
              {codingChallenges.map((challenge) => (
                <div className="card" key={challenge.id} style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge ${challenge.difficulty === 'easy' ? 'badge-success' : 'badge-warning'}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{challenge.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '16px', minHeight: '60px' }}>
                      {challenge.description.slice(0, 100)}...
                    </p>
                  </div>
                  <button onClick={() => handleStartCodingChallenge(challenge.id)} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                    Solve Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Coding Challenge Room Editor */}
        {/* ---------------------------------------------------- */}
        {subView === 'coding-room' && activeCodingChallenge && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">{activeCodingChallenge.title}</h1>
                <span className="badge badge-info">{activeCodingChallenge.difficulty}</span>
              </div>
              <button onClick={() => setSubView('coding')} className="btn btn-secondary">
                Back to Challenges
              </button>
            </div>

            <div className="coding-layout">
              {/* Problem specifications */}
              <div className="coding-sidebar">
                <div className="card" style={{ height: '100%' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Description</h3>
                  <p style={{ fontSize: '14px', color: 'var(--main-text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {activeCodingChallenge.description}
                  </p>

                  <h4 style={{ fontSize: '14px', marginTop: '24px', marginBottom: '8px' }}>Starter Test Cases</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCodingChallenge.test_cases?.slice(0, 2).map((tc, i) => (
                      <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', fontFamily: 'monospace' }}>
                        <div><strong>Input:</strong> {tc.input}</div>
                        <div><strong>Output:</strong> {tc.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compiler editor pane */}
              <div className="coding-editor-panel">
                <div className="editor-header">
                  <span className="editor-title">code_solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'js'}</span>
                  <select 
                    className="editor-lang-select"
                    value={selectedLanguage}
                    onChange={(e) => handleLangChange(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <textarea 
                  className="editor-textarea"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="// Write your code here"
                ></textarea>

                {codingSubmissionResult && (
                  <div className="editor-console">
                    <div>=== Compilation Console ===</div>
                    <div>Status: <span style={{ color: codingSubmissionResult.status === 'passed' ? '#10B981' : '#EF4444' }}>{codingSubmissionResult.status.toUpperCase()}</span></div>
                    <div>Tests Passed: {codingSubmissionResult.passed_cases}/{codingSubmissionResult.total_cases} ({codingSubmissionResult.score}%)</div>
                    <div>Complexity: Time: {codingSubmissionResult.complexity_time} | Space: {codingSubmissionResult.complexity_space}</div>
                    <div style={{ color: '#E2E8F0', marginTop: '8px' }}>Feedback: {codingSubmissionResult.feedback}</div>
                  </div>
                )}

                <div className="editor-footer">
                  <button onClick={handleSubmitCodingSolution} className="btn btn-success" disabled={loading}>
                    {loading ? 'Executing...' : 'Run & Submit Code'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Interview History List */}
        {/* ---------------------------------------------------- */}
        {subView === 'history' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Practice History Reports</h1>
                <p className="page-subtitle">Access scores, positive points, and detailed question logs from past sessions.</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Role type</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Date Taken</th>
                    <th>Overall Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((hist) => (
                    <tr key={hist.id}>
                      <td style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>{hist.role}</td>
                      <td><span className="badge badge-info">{hist.type}</span></td>
                      <td>{hist.difficulty}</td>
                      <td>{new Date(hist.created_at).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700 }}>
                        {hist.status === 'completed' ? `${hist.overall_score}%` : 'Incomplete'}
                      </td>
                      <td>
                        {hist.status === 'completed' ? (
                          <button onClick={() => handleOpenResults(hist.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            View Report Card
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {historyList.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        No interview history found. Go start a mock session!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Learning Roadmap */}
        {/* ---------------------------------------------------- */}
        {subView === 'roadmap' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Personalized Learning Roadmap</h1>
                <p className="page-subtitle">Auto-generated week-by-week actions to resolve weaknesses detected during practice.</p>
              </div>
            </div>

            <div className="card" style={{ maxWidth: '720px' }}>
              <div className="roadmap-timeline">
                {roadmapWeeks.map((item, index) => (
                  <div key={index} className={`roadmap-week-item ${item.status}`}>
                    <div className="roadmap-dot"></div>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '15px' }}>Week {item.week}: {item.topic}</h4>
                        <span className={`badge ${item.status === 'completed' ? 'badge-success' : item.status === 'ongoing' ? 'badge-warning' : 'badge-info'}`}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginTop: '4px' }}>
                        {item.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: AI Career Coach Chat */}
        {/* ---------------------------------------------------- */}
        {subView === 'coach' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">AI Career Coach</h1>
                <p className="page-subtitle">Conversational advisor for resumes, technical definitions, and STAR methods.</p>
              </div>
            </div>

            <div className="grid-cols-3">
              {/* Left Column: Preset prompts */}
              <div className="card">
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Suggested Preparations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleQuickPrompt("Improve my Java interview")} className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start' }}>
                    👉 Improve my Java interview
                  </button>
                  <button onClick={() => handleQuickPrompt("Create a 4-week study plan")} className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start' }}>
                    👉 Create a 4-week study plan
                  </button>
                  <button onClick={() => handleQuickPrompt("How to write an ATS-friendly resume")} className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start' }}>
                    👉 How to write an ATS resume
                  </button>
                  <button onClick={() => handleQuickPrompt("Give me STAR method examples")} className="btn btn-secondary" style={{ fontSize: '12px', justifyContent: 'flex-start' }}>
                    👉 Give me STAR method examples
                  </button>
                </div>
              </div>

              {/* Right Column: Chat dialog */}
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <div className="chat-container">
                  <div className="chat-history">
                    {coachMessages.map((msg, i) => (
                      <div key={i} className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                        {msg.text}
                      </div>
                    ))}
                    {coachSending && (
                      <div className="chat-bubble chat-bubble-ai" style={{ opacity: 0.7 }}>
                        AI Coach is typing advice...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCoachSendMessage} className="chat-input-row">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ask the coach about JVM, Python decorators, or resumes..." 
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                      disabled={coachSending}
                    />
                    <button type="submit" id="coach-submit-btn" className="btn btn-primary" disabled={coachSending || !coachInput.trim()}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBVIEW: Billing Invoices & plans pricing */}
        {/* ---------------------------------------------------- */}
        {subView === 'billing' && (
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">Billing & Membership</h1>
                <p className="page-subtitle">View current plan details, checkout subscription plans, and download GST invoices.</p>
              </div>
            </div>

            <div className="grid-cols-3">
              {/* Active Plan info */}
              <div className="card">
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Current Active Plan</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Award size={24} style={{ color: 'var(--primary-blue)' }} />
                  <div>
                    <h4 style={{ fontSize: '18px', textTransform: 'uppercase' }}>
                      {currentSub ? currentSub.plan_name : 'Free'}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>
                      {currentSub && currentSub.status === 'active' 
                        ? `Renews on: ${new Date(currentSub.current_period_end).toLocaleDateString()}`
                        : 'Free access limited.'}
                    </span>
                  </div>
                </div>
                {currentSub && currentSub.plan_id > 1 && currentSub.status === 'active' && (
                  <button onClick={handleCancelSubscription} className="btn btn-secondary" style={{ width: '100%', color: 'var(--error-color)', borderColor: 'rgba(197, 48, 48, 0.2)' }}>
                    Cancel renewal
                  </button>
                )}
              </div>

              {/* Upgrades grid */}
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Upgrade Membership</h3>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  {plans.filter(p => p.price_monthly > 0).map(p => (
                    <div key={p.id} style={{ flexGrow: 1, padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{p.name} Plan</span>
                      <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{p.price_monthly}<span>/mo</span></div>
                      <button onClick={() => setCheckoutPlanId(p.id)} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px', marginTop: 'auto' }}>
                        Select Upgrade
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoices list */}
            <div className="card" style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Invoice Download Statements</h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Plan Type</th>
                      <th>Billing Period</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Invoice PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.invoice_number}</td>
                        <td>{inv.plan_name}</td>
                        <td>Monthly</td>
                        <td>₹{inv.total_amount}</td>
                        <td><span className="badge badge-success">Paid</span></td>
                        <td>
                          <a href="#" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={(e) => { e.preventDefault(); alert(`Downloading invoice ${inv.invoice_number} PDF...`); }}>
                            <Download size={12} /> GST PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                          No invoices found. Upgrade to Pro to see statement histories.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Checkout Overlay */}
            {checkoutPlanId && (
              <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="card" style={{ maxWidth: '440px', width: '100%', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Upgrade Membership Checkout</h3>
                  
                  <form onSubmit={handleCheckoutSubmit}>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select 
                        className="form-control"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="upi">UPI / GPay / PhonePe</option>
                        <option value="card">Credit or Debit Card</option>
                        <option value="netbanking">Net Banking</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Apply Promo Coupon</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="E.g., WELCOME50" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                      <button type="button" onClick={() => setCheckoutPlanId(null)} className="btn btn-secondary">
                        Cancel Checkout
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing Payment...' : 'Confirm UPI Checkout'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation menu */}
      <nav className="mobile-bottom-nav">
        <a href="#" className={`mobile-nav-link ${subView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('dashboard'); }}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className={`mobile-nav-link ${subView === 'setup' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('setup'); }}>
          <Play size={20} />
          <span>Practice</span>
        </a>
        <a href="#" className={`mobile-nav-link ${subView === 'coding' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('coding'); }}>
          <Code size={20} />
          <span>Code</span>
        </a>
        <a href="#" className={`mobile-nav-link ${subView === 'coach' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSubView('coach'); }}>
          <MessageSquare size={20} />
          <span>Coach</span>
        </a>
      </nav>
    </div>
  );
}
