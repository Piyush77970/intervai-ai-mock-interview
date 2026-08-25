const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'intervai.db');

// Ensure database directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

// Run commands sequentially
db.serialize(() => {
  console.log('Initializing database tables...');

  // 1. Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'candidate', -- 'candidate', 'recruiter', 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 2. Profiles
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    education TEXT,
    experience_years REAL DEFAULT 0,
    preferred_role TEXT,
    skills TEXT, -- JSON string of skills array
    location TEXT,
    career_goals TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 3. Resumes
  db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 4. Resume Analysis
  db.run(`CREATE TABLE IF NOT EXISTS resume_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER UNIQUE NOT NULL,
    overall_score INTEGER NOT NULL,
    ats_compatibility INTEGER NOT NULL,
    extracted_skills TEXT, -- JSON string
    missing_skills TEXT, -- JSON string
    suggestions TEXT, -- JSON string of suggestions array
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE CASCADE
  )`);

  // 5. Job Descriptions
  db.run(`CREATE TABLE IF NOT EXISTS job_descriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT,
    raw_text TEXT NOT NULL,
    extracted_skills TEXT, -- JSON string
    match_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 6. Interviews
  db.run(`CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    type TEXT NOT NULL, -- 'technical', 'hr', 'behavioral', 'coding', 'system-design', 'resume-based', 'job-specific', 'mixed'
    difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard', 'expert'
    duration_minutes INTEGER DEFAULT 15,
    mode TEXT NOT NULL, -- 'text', 'voice', 'video'
    status TEXT NOT NULL DEFAULT 'setup', -- 'setup', 'active', 'completed'
    overall_score REAL DEFAULT 0,
    feedback_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 7. Interview Questions
  db.run(`CREATE TABLE IF NOT EXISTS interview_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    expected_concepts TEXT, -- JSON string array
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY(interview_id) REFERENCES interviews(id) ON DELETE CASCADE
  )`);

  // 8. Answers
  db.run(`CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    audio_url TEXT,
    video_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
  )`);

  // 9. Answer Evaluations
  db.run(`CREATE TABLE IF NOT EXISTS answer_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    answer_id INTEGER UNIQUE NOT NULL,
    score REAL NOT NULL,
    correctness REAL NOT NULL,
    relevance REAL NOT NULL,
    completeness REAL NOT NULL,
    technical_depth REAL NOT NULL,
    communication REAL NOT NULL,
    star_situation TEXT,
    star_task TEXT,
    star_action TEXT,
    star_result TEXT,
    feedback_positive TEXT,
    feedback_improve TEXT,
    feedback_missing TEXT,
    suggested_answer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(answer_id) REFERENCES answers(id) ON DELETE CASCADE
  )`);

  // 10. Coding Questions
  db.run(`CREATE TABLE IF NOT EXISTS coding_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    starter_code TEXT, -- JSON string object { java, python, cpp, javascript }
    test_cases TEXT -- JSON string array of test cases
  )`);

  // 11. Coding Submissions
  db.run(`CREATE TABLE IF NOT EXISTS coding_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    coding_question_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL, -- 'passed', 'failed', 'error'
    passed_cases INTEGER DEFAULT 0,
    total_cases INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    complexity_time TEXT,
    complexity_space TEXT,
    feedback TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(coding_question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
  )`);

  // 12. Learning Plans (Roadmaps)
  db.run(`CREATE TABLE IF NOT EXISTS learning_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weakness_topic TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'ongoing', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 13. Notifications
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'streak', 'score', 'payment', 'roadmap'
    read_status INTEGER DEFAULT 0, -- 0 for false, 1 for true
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 14. Plans
  db.run(`CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    features TEXT, -- JSON string array
    limits TEXT, -- JSON string limit counts { interviews, resume_analyses }
    is_active INTEGER DEFAULT 1
  )`);

  // 15. Subscriptions
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    plan_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly'
    current_period_start DATETIME NOT NULL,
    current_period_end DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(plan_id) REFERENCES plans(id) ON DELETE CASCADE
  )`);

  // 16. Payments
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL, -- 'upi', 'card', 'netbanking'
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
  )`);

  // 17. Invoices
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT,
    tax_amount REAL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(payment_id) REFERENCES payments(id) ON DELETE CASCADE
  )`);

  // 18. Coupons
  db.run(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- 'percent', 'fixed'
    discount_value INTEGER NOT NULL,
    expiration_date DATETIME,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0
  )`);

  // 19. Coupon Redemptions
  db.run(`CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // 20. Refunds
  db.run(`CREATE TABLE IF NOT EXISTS refunds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    reason TEXT,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(payment_id) REFERENCES payments(id) ON DELETE CASCADE
  )`);

  // 21. Recruiters
  db.run(`CREATE TABLE IF NOT EXISTS recruiters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    organization_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE SET NULL
  )`);

  // 22. Organizations
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 23. Jobs
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    template_settings TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
  )`);

  // 24. Candidate Invitations
  db.run(`CREATE TABLE IF NOT EXISTS candidate_invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    invite_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'accepted', 'completed'
    interview_id INTEGER,
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY(interview_id) REFERENCES interviews(id) ON DELETE SET NULL
  )`);

  console.log('Database tables successfully created!');

  // Now, Seed Data!
  console.log('Seeding data...');

  // Helper to hash password mock (bcrypt takes time, let's use a standard bcrypt pre-hashed value for 'password123'
  // pre-hashed '$2a$10$uV.XfV20kKxO2x6w/Z3DquF/cZ.G2tC2eZ/c8xK6j.E1P3F24.PFe' which matches bcryptjs
  const mockPasswordHash = '$2a$10$uV.XfV20kKxO2x6w/Z3DquF/cZ.G2tC2eZ/c8xK6j.E1P3F24.PFe';

  // Seed Users
  db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES 
    (1, 'Aditya Kumar', 'aditya@example.com', '${mockPasswordHash}', 'candidate'),
    (2, 'Sarah Jenkins', 'sarah.hr@google.com', '${mockPasswordHash}', 'recruiter'),
    (3, 'Super Admin', 'admin@intervai.com', '${mockPasswordHash}', 'admin')
  `);

  // Seed Profiles
  const adityaSkills = JSON.stringify(['Java', 'SQL', 'Git', 'REST API', 'JavaScript', 'HTML/CSS']);
  db.run(`INSERT OR IGNORE INTO profiles (id, user_id, education, experience_years, preferred_role, skills, location, career_goals, avatar_url, xp, level, streak_days) VALUES 
    (1, 1, 'Bachelor of Technology in CS', 2, 'Java Developer', '${adityaSkills}', 'Bengaluru, India', 'Transition to a senior backend role at a product SaaS startup.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80', 1250, 4, 5)
  `);

  // Seed Plans
  db.run(`INSERT OR IGNORE INTO plans (id, name, price_monthly, price_yearly, features, limits) VALUES 
    (1, 'Free', 0, 0, 
     '["3 interviews/month", "Text interviews", "Basic feedback", "Basic dashboard", "Limited AI career coach"]', 
     '{"interviews": 3, "resume_analyses": 1}'),
    (2, 'Student', 149, 1490, 
     '["Increased interview limits (10/mo)", "Voice interviews", "Resume analysis", "Basic coding interviews", "AI feedback", "Learning roadmap"]', 
     '{"interviews": 10, "resume_analyses": 3}'),
    (3, 'Pro', 299, 2990, 
     '["Unlimited text interviews", "Voice interviews", "Resume analysis", "Job description analysis", "Adaptive interviews", "Coding interviews", "Advanced analytics", "AI career coach"]', 
     '{"interviews": 9999, "resume_analyses": 9999}'),
    (4, 'Premium', 599, 5990, 
     '["Everything in Pro", "Video interviews", "Advanced communication analysis", "Unlimited coding practice", "Job-specific interviews", "Advanced AI feedback", "Interview replay"]', 
     '{"interviews": 9999, "resume_analyses": 9999}')
  `);

  // Seed Organizations & Recruiters
  db.run(`INSERT OR IGNORE INTO organizations (id, name, logo_url) VALUES (1, 'Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg')`);
  db.run(`INSERT OR IGNORE INTO recruiters (id, user_id, organization_id) VALUES (1, 2, 1)`);

  // Seed Jobs
  db.run(`INSERT OR IGNORE INTO jobs (id, organization_id, title, description, template_settings) VALUES 
    (1, 1, 'Associate Java Developer', 'We are looking for an Associate Java Developer who is proficient in Java, Spring Boot, and REST API development. Requirements include 1-3 years experience, clean code principles, and basic database design with SQL.', '{"difficulty": "medium", "type": "technical", "mode": "voice"}')
  `);

  // Seed Coupons
  db.run(`INSERT OR IGNORE INTO coupons (id, code, discount_type, discount_value, max_uses, used_count) VALUES 
    (1, 'WELCOME50', 'percent', 50, 1000, 12),
    (2, 'STUDENT90', 'percent', 90, 500, 48),
    (3, 'DIWALI200', 'fixed', 200, 100, 5)
  `);

  // Seed Coding Questions
  const starterCodeBinary = JSON.stringify({
    java: `public class Solution {\n    public int binarySearch(int[] nums, int target) {\n        // Write your code here\n        return -1;\n    }\n}`,
    python: `def binary_search(nums: list[int], target: int) -> int:\n    # Write your code here\n    return -1`,
    cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int binarySearch(vector<int>& nums, int target) {\n        // Write your code here\n        return -1;\n    }\n};`,
    javascript: `function binarySearch(nums, target) {\n    // Write your code here\n    return -1;\n}`
  });
  const testCasesBinary = JSON.stringify([
    { input: '[-1,0,3,5,9,12], 9', output: '4' },
    { input: '[-1,0,3,5,9,12], 2', output: '-1' }
  ]);

  const starterCodeReverse = JSON.stringify({
    java: `public class Solution {\n    public String reverseString(String s) {\n        // Write your code here\n        return "";\n    }\n}`,
    python: `def reverse_string(s: str) -> str:\n    # Write your code here\n    return ""`,
    cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string reverseString(string s) {\n        // Write your code here\n        return "";\n    }\n};`,
    javascript: `function reverseString(s) {\n    // Write your code here\n    return "";\n}`
  });
  const testCasesReverse = JSON.stringify([
    { input: '"hello"', output: '"olleh"' },
    { input: '"Hannah"', output: '"hannaH"' }
  ]);

  db.run(`INSERT OR IGNORE INTO coding_questions (id, title, description, difficulty, starter_code, test_cases) VALUES 
    (1, 'Binary Search', 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.', 'medium', '${starterCodeBinary}', '${testCasesBinary}'),
    (2, 'Reverse String', 'Write a function that reverses a string. The input string is given as an array of characters or standard string s. You must do this by modifying the input array in-place with O(1) extra memory.', 'easy', '${starterCodeReverse}', '${testCasesReverse}')
  `);

  // Seed Notifications
  db.run(`INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, read_status) VALUES 
    (1, 1, '🔥 5-Day Streak Active!', 'Keep practicing to maintain your daily interview readiness streak.', 'streak', 0),
    (2, 1, '📈 Interview Score Improved!', 'Your latest technical interview score went up by 8% compared to last week.', 'score', 0),
    (3, 1, '🗺️ Learning Roadmap Generated', 'Your custom week-by-week Java learning roadmap is ready based on detected exceptions weaknesses.', 'roadmap', 1)
  `);

  // Seed Subscriptions for Candidate Aditya
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const formattedNextMonth = nextMonth.toISOString().slice(0, 19).replace('T', ' ');
  db.run(`INSERT OR IGNORE INTO subscriptions (id, user_id, plan_id, status, billing_cycle, current_period_start, current_period_end) VALUES 
    (1, 1, 3, 'active', 'monthly', '2026-08-19 00:00:00', '${formattedNextMonth}')
  `);

  // Seed Payments & Invoices for Aditya
  db.run(`INSERT OR IGNORE INTO payments (id, user_id, subscription_id, amount, payment_method, transaction_id, status, created_at) VALUES 
    (1, 1, 1, 299, 'upi', 'tx_98124701298471', 'success', '2026-08-19 12:00:00')
  `);
  db.run(`INSERT OR IGNORE INTO invoices (id, payment_id, invoice_number, pdf_url, tax_amount, total_amount, created_at) VALUES 
    (1, 1, 'INV-2026-0001', '/invoices/inv-2026-0001.pdf', 45.6, 299, '2026-08-19 12:00:00')
  `);

  // Seed Sample Completed Interview
  db.run(`INSERT OR IGNORE INTO interviews (id, user_id, role, experience_level, type, difficulty, duration_minutes, mode, status, overall_score, feedback_summary, created_at) VALUES 
    (1, 1, 'Java Developer', '1-3 years', 'technical', 'medium', 10, 'text', 'completed', 82.0, 'Demonstrates strong core knowledge in OOP and Java collections. Communication is clear but code complexity answers could use more structural details (e.g. referencing time limits or concurrency).', '2026-08-18 15:30:00')
  `);

  // Seed Sample Questions for Interview 1
  db.run(`INSERT OR IGNORE INTO interview_questions (id, interview_id, question_text, expected_concepts, sort_order) VALUES 
    (1, 1, 'What is the difference between an Interface and an Abstract Class in Java?', '["Multiple inheritance", "Default methods", "State variables", "Access modifiers"]', 1),
    (2, 1, 'Explain how the Garbage Collector works in the JVM.', '["Mark and sweep", "Heap generations", "Eden space", "Minor vs Major GC"]', 2)
  `);

  // Seed Answers for Interview 1
  db.run(`INSERT OR IGNORE INTO answers (id, interview_id, question_id, answer_text, duration_seconds, submitted_at) VALUES 
    (1, 1, 1, 'In Java, an abstract class can have instance fields and a constructor, and can define state. An interface is a contract and cannot hold state, though since Java 8 it can have default and static methods. A class can extend only one abstract class but can implement multiple interfaces, allowing a form of multiple inheritance.', 120, '2026-08-18 15:34:00'),
    (2, 1, 2, 'The JVM garbage collector automatically manages memory. It divides the heap memory into generations: Young Generation (consisting of Eden, Survivor spaces) and Old Generation. It works by tracking reachable objects from GC roots. Unreachable objects are marked and swept. Minor GC cleans Young generation which is frequent, while Major GC runs on the Old generation.', 180, '2026-08-18 15:39:00')
  `);

  // Seed Evaluations for Interview 1
  db.run(`INSERT OR IGNORE INTO answer_evaluations (id, answer_id, score, correctness, relevance, completeness, technical_depth, communication, star_situation, star_task, star_action, star_result, feedback_positive, feedback_improve, feedback_missing, suggested_answer) VALUES 
    (1, 1, 8.5, 9.0, 9.0, 8.0, 8.0, 9.0, NULL, NULL, NULL, NULL, 
     'Accurately explains multiple inheritance limits and Java 8 default methods.', 
     'Mention access modifiers restrictions (interfaces are public by default; abstract classes allow protected/private methods).', 
     'Details regarding private interface methods introduced in Java 9.', 
     'An interface is a type definition which defines behavior but not state, allowing classes to implement multiple interfaces. An abstract class is a partial class implementation that can define state variables and constructor logic. Abstract classes allow private/protected members while interfaces default to public.'),
    
    (2, 2, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, NULL, NULL, NULL, NULL, 
     'Correctly identifies heap generations (Eden, Survivor, Old) and the mark-and-sweep mechanism.', 
     'Mention specific GC algorithms like G1GC, ZGC or CMS which are commonly asked in technical interviews.', 
     'Distinction between G1GC and CMS collectors.', 
     'The JVM Garbage Collector manages heap memory allocations automatically. It works in three phases: marking live objects from GC roots, sweeping dead objects, and compacting memory. Heap is split into Young (Eden, S0, S1) where short-lived objects are allocated, and Tenured/Old generation. GC algorithms include Serial, Parallel, G1GC (Garbage First), and ZGC.')
  `);

  // Seed Learning Plans
  db.run(`INSERT OR IGNORE INTO learning_plans (id, user_id, weakness_topic, suggested_action, week_number, status) VALUES 
    (1, 1, 'Java Garbage Collection Algorithms', 'Study CMS vs G1GC collectors, JVM tuning parameters like -XX:+UseG1GC, and practice explaining memory leaks in profiles.', 1, 'completed'),
    (2, 1, 'Spring Boot Exception Handling', 'Implement @ControllerAdvice and @ExceptionHandler methods inside a sample REST application to gracefully return standard JSON error structures.', 2, 'ongoing'),
    (3, 1, 'Multithreading and Synchronization', 'Learn the ExecutorService, thread pools, locks (ReentrantLock), and concurrent collections (ConcurrentHashMap) through coding practical challenges.', 3, 'pending')
  `);

  console.log('Database successfully initialized and seeded!');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database connection:', err);
  } else {
    console.log('Database connection closed.');
  }
});
