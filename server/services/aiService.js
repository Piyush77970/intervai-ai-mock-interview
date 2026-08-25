const https = require('https');

// Simple helper to call Gemini REST API if key is present
function callGemini(prompt, responseSchema = null) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error('GEMINI_API_KEY is not configured'));
    }

    const data = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: responseSchema ? {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      } : undefined
    });

    const options = {
      hostname: 'generativetool.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0]) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('Invalid response structure from Gemini API: ' + body));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// Extensive local question bank for simulation
const QUESTION_BANK = {
  'Java Developer': {
    technical: [
      { text: "What is the difference between an Interface and an Abstract Class in Java?", concepts: ["Multiple inheritance", "Default methods", "State variables", "Access modifiers"] },
      { text: "Explain how the Garbage Collector works in the JVM.", concepts: ["Mark and sweep", "Heap generations", "Eden space", "Minor vs Major GC"] },
      { text: "What is the difference between fail-fast and fail-safe iterators?", concepts: ["ConcurrentModificationException", "ModCount", "CopyOnWrite", "Collection cloning"] },
      { text: "How does HashMap handle collisions internally in Java 8?", concepts: ["Chaining", "LinkedList", "TreeNode", "Red-Black Tree", "HashCode hash function"] }
    ],
    hr: [
      { text: "Why do you want to join our organization as a Java Developer?", concepts: ["Company products", "Java stack scaling", "Professional growth"] },
      { text: "Describe a time you had to resolve a conflict in a software team.", concepts: ["Communication", "Empathy", "Conflict resolution", "Collaboration"] }
    ],
    behavioral: [
      { text: "Tell me about a challenging Java bug you resolved in production.", concepts: ["Problem-solving", "Debugging tools", "Root cause analysis", "Result"] },
      { text: "Give an example of a project where you had to learn a new framework quickly.", concepts: ["Adaptability", "Learning speed", "Application", "Project outcome"] }
    ],
    coding: [
      { text: "Write a function in Java to reverse a string in-place.", concepts: ["String building", "In-place reversal", "O(1) memory"] }
    ]
  },
  'Python Developer': {
    technical: [
      { text: "Explain the difference between list and tuple, and when to use each.", concepts: ["Immutability", "Memory allocation", "Hashable key", "Syntax differences"] },
      { text: "What is the Python Global Interpreter Lock (GIL) and how does it affect multi-threading?", concepts: ["Single thread execution", "Cpython implementation", "Multiprocessing", "I/O bound vs CPU bound"] },
      { text: "How do Python decorators work? Can you give an example?", concepts: ["First-class functions", "Wrapper function", "@ syntax", "Closure scope"] },
      { text: "What is the difference between deepcopy and shallow copy in Python?", concepts: ["Reference copying", "Nested objects", "copy module", "Recursive copy"] }
    ],
    hr: [
      { text: "What attracts you to Python development compared to other stacks?", concepts: ["Readability", "Data science integration", "Rapid prototyping"] }
    ],
    behavioral: [
      { text: "Explain a situation where you had to optimize slow Python code.", concepts: ["Profiling", "List comprehensions", "Vectorization", "Complexity reduction"] }
    ]
  },
  'Web Developer': {
    technical: [
      { text: "Explain the CSS Box Model and how box-sizing affects it.", concepts: ["Content padding border", "Margin", "border-box vs content-box", "Element dimensions"] },
      { text: "What is Event Delegation in JavaScript and how does it work?", concepts: ["Event bubbling", "Event capture", "Parent listener", "Target element"] },
      { text: "Explain how React virtual DOM works and improves performance.", concepts: ["Reconciliation", "Diffing algorithm", "State changes", "Batch updates"] }
    ],
    behavioral: [
      { text: "Tell me about a time you optimized a website LCP (Largest Contentful Paint) score.", concepts: ["Image compression", "Lazy loading", "Render-blocking resources", "Performance score"] }
    ]
  },
  'Full Stack Developer': {
    technical: [
      { text: "Describe the differences between SQL databases and NoSQL databases.", concepts: ["Schema definition", "Horizontal vs vertical scaling", "ACID properties", "Joins"] },
      { text: "What is CORS (Cross-Origin Resource Sharing) and how do you resolve it?", concepts: ["Access-Control-Allow-Origin", "Preflight options request", "Browser security", "Middleware config"] },
      { text: "Explain JWT (JSON Web Token) auth and where it should be stored.", concepts: ["Header payload signature", "Localstorage vs Cookies", "Stateless session", "XSS CSRF"] }
    ],
    behavioral: [
      { text: "Tell me about a time you designed a full stack architecture from scratch.", concepts: ["Database schema design", "API design", "Frontend architecture", "Deployment"] }
    ]
  }
};

// Fallback questions if role is not in the bank
const GENERAL_QUESTIONS = {
  technical: [
    { text: "Describe a complex technical system you worked on recently.", concepts: ["Architecture", "Database", "APIs", "Performance bottlenecks"] },
    { text: "How do you ensure code quality and write clean code in your projects?", concepts: ["Unit testing", "Linters", "Code reviews", "Design patterns"] }
  ],
  hr: [
    { text: "Tell me about yourself and your career goals.", concepts: ["Background", "Key skills", "Short-term goals", "Long-term vision"] },
    { text: "What are your greatest professional strengths and weaknesses?", concepts: ["Self-awareness", "Specific strengths", "Improvement areas"] }
  ],
  behavioral: [
    { text: "Describe a situation where you made a mistake at work and how you handled it.", concepts: ["Situation", "Mistake recognition", "Correction steps", "Lesson learned"] },
    { text: "Explain how you manage tight deadlines and prioritize tasks under pressure.", concepts: ["Task scheduling", "Time management", "Communication", "Delegation"] }
  ]
};

/**
 * Generate questions for interview setup
 */
async function generateQuestions({ role, experience_level, type, difficulty, resumeText, jobDescription }) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a professional technical interviewer. Generate 5 interview questions for a candidate with the following details:
        Role: ${role}
        Experience: ${experience_level}
        Interview Type: ${type}
        Difficulty: ${difficulty}
        Candidate Resume context: ${resumeText || 'None provided'}
        Job Description context: ${jobDescription || 'None provided'}

        Output a JSON array of objects, each containing:
        - question_text: The interview question string
        - expected_concepts: An array of 3-5 core technical concepts/keywords that should be mentioned in a good answer.

        Return ONLY the raw JSON array.`;

      const responseSchema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question_text: { type: "STRING" },
            expected_concepts: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["question_text", "expected_concepts"]
        }
      };

      const result = await callGemini(prompt, responseSchema);
      return JSON.parse(result);
    } catch (e) {
      console.warn('Gemini question generation failed, falling back to local simulation database:', e.message);
    }
  }

  // Local simulation question fetcher
  const roleBank = QUESTION_BANK[role] || QUESTION_BANK['Full Stack Developer'];
  let pool = [];

  if (type === 'mixed') {
    pool = [...(roleBank.technical || []), ...(roleBank.behavioral || []), ...(roleBank.hr || [])];
  } else {
    pool = roleBank[type] || GENERAL_QUESTIONS[type] || GENERAL_QUESTIONS.technical;
  }

  // Shuffle and pick 4 questions
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  // If we don't have enough, fill from general pool
  while (selected.length < 4) {
    const generalPool = [...GENERAL_QUESTIONS.technical, ...GENERAL_QUESTIONS.behavioral, ...GENERAL_QUESTIONS.hr];
    const fill = generalPool[Math.floor(Math.random() * generalPool.length)];
    if (!selected.find(q => q.text === fill.text)) {
      selected.push(fill);
    }
  }

  return selected.map((q, idx) => ({
    question_text: q.text,
    expected_concepts: q.concepts,
    sort_order: idx + 1
  }));
}

/**
 * Evaluate a candidate's answer
 */
async function evaluateAnswer({ question, expectedConcepts, answerText, mode }) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a professional technical recruiter. Evaluate the following candidate answer:
        Question: ${question}
        Expected Core Concepts: ${JSON.stringify(expectedConcepts)}
        Candidate Answer: ${answerText}
        Interview Mode: ${mode}

        Perform a structured scoring out of 10. Also evaluate STAR method coverage for behavioral questions (Situation, Task, Action, Result).
        
        Output a JSON object with:
        - score: Overall rating (0 to 10 decimal)
        - correctness: Rating for accurate technical statements (0 to 10)
        - relevance: How well they addressed the prompt (0 to 10)
        - completeness: Did they hit expected points? (0 to 10)
        - technical_depth: Level of detail (0 to 10)
        - communication: Clarity and structure (0 to 10)
        - star_situation: Evaluation of the STAR Situation context (or null if not behavioral)
        - star_task: Evaluation of the STAR Task context (or null if not behavioral)
        - star_action: Evaluation of the STAR Action context (or null if not behavioral)
        - star_result: Evaluation of the STAR Result context (or null if not behavioral)
        - feedback_positive: String summarizing what went well
        - feedback_improve: String summarizing how they can improve
        - feedback_missing: String listing what crucial items were missing
        - suggested_answer: A high-quality model answer to learn from

        Return ONLY the raw JSON.`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          score: { type: "NUMBER" },
          correctness: { type: "NUMBER" },
          relevance: { type: "NUMBER" },
          completeness: { type: "NUMBER" },
          technical_depth: { type: "NUMBER" },
          communication: { type: "NUMBER" },
          star_situation: { type: "STRING" },
          star_task: { type: "STRING" },
          star_action: { type: "STRING" },
          star_result: { type: "STRING" },
          feedback_positive: { type: "STRING" },
          feedback_improve: { type: "STRING" },
          feedback_missing: { type: "STRING" },
          suggested_answer: { type: "STRING" }
        },
        required: [
          "score", "correctness", "relevance", "completeness", "technical_depth", "communication",
          "feedback_positive", "feedback_improve", "feedback_missing", "suggested_answer"
        ]
      };

      const result = await callGemini(prompt, responseSchema);
      return JSON.parse(result);
    } catch (e) {
      console.warn('Gemini answer evaluation failed, falling back to local simulation:', e.message);
    }
  }

  // Local Heuristic Scoring Engine
  const cleanAnswer = answerText.toLowerCase();
  let hits = 0;
  const missing = [];
  const parsedConcepts = Array.isArray(expectedConcepts) ? expectedConcepts : JSON.parse(expectedConcepts || '[]');

  parsedConcepts.forEach(c => {
    const conceptWords = c.toLowerCase().split(' ');
    // If any key word of the concept is hit, increment
    const hasWord = conceptWords.some(word => cleanAnswer.includes(word));
    if (hasWord) {
      hits++;
    } else {
      missing.push(c);
    }
  });

  const wordCount = answerText.trim().split(/\s+/).length;
  let completenessScore = 0;
  if (parsedConcepts.length > 0) {
    completenessScore = Math.min(10, Math.round((hits / parsedConcepts.length) * 10));
  } else {
    completenessScore = wordCount > 40 ? 9 : 5;
  }

  let correctnessScore = 6;
  if (hits > 0) correctnessScore += Math.min(4, hits);
  if (wordCount < 10) correctnessScore = Math.max(1, correctnessScore - 4);

  const relevanceScore = wordCount > 5 ? (cleanAnswer.includes('why') || cleanAnswer.includes('how') || hits > 0 ? 9 : 6) : 2;
  const depthScore = Math.min(10, Math.max(2, Math.round(wordCount / 20) + (hits * 1.5)));
  const commScore = wordCount > 30 && wordCount < 200 ? 9 : 7;
  const overall = parseFloat(((correctnessScore + relevanceScore + completenessScore + depthScore + commScore) / 5).toFixed(1));

  // Simulated behavioral STAR analysis
  let star_situation = null;
  let star_task = null;
  let star_action = null;
  let star_result = null;

  const isBehavioral = question.toLowerCase().includes('tell me about') || 
                        question.toLowerCase().includes('describe a time') || 
                        question.toLowerCase().includes('give an example');

  if (isBehavioral) {
    star_situation = cleanAnswer.includes('when I') || cleanAnswer.includes('project') || cleanAnswer.includes('company')
      ? 'Clear background context of the project or team setting.' 
      : 'Missing explicit context. Explain the situation details.';
    
    star_task = cleanAnswer.includes('task') || cleanAnswer.includes('responsible') || cleanAnswer.includes('role')
      ? 'Defined responsibility and deliverables.' 
      : 'Provide a clearer description of your specific task assignment.';
    
    star_action = cleanAnswer.includes('solved') || cleanAnswer.includes('implemented') || cleanAnswer.includes('designed') || cleanAnswer.includes('wrote')
      ? 'Excellent description of steps taken (coded, resolved, coordinated).' 
      : 'Missing descriptive action verbs showing your direct contribution.';
    
    star_result = cleanAnswer.includes('result') || cleanAnswer.includes('improved') || cleanAnswer.includes('saved') || cleanAnswer.includes('%') || cleanAnswer.includes('success')
      ? 'Outlined final outcomes (metrics, bug resolved, shipped feature).' 
      : 'Missing measurable outcomes. Quantify your project achievements.';
  }

  return {
    score: overall,
    correctness: correctnessScore,
    relevance: relevanceScore,
    completeness: completenessScore,
    technical_depth: depthScore,
    communication: commScore,
    star_situation,
    star_task,
    star_action,
    star_result,
    feedback_positive: `Great start! You provided a responses with ${wordCount} words and touched upon key themes. Your answer relevance was solid.`,
    feedback_improve: missing.length > 0 
      ? `Try to incorporate structural concepts like: ${missing.slice(0, 2).join(', ')}. Expand on operational complexities.`
      : `Structure your response further by discussing runtime performance (Time/Space complexities) and alternative approaches.`,
    feedback_missing: missing.length > 0 ? missing.join(', ') : 'None. You hit all expected topics!',
    suggested_answer: `For ${question}: A strong response should detail the architectural tradeoffs. Address the conceptual definitions clearly, outline core mechanisms (e.g. JVM memory tiers, lifecycle methods, concurrency controls), and illustrate with a specific implementation example.`
  };
}

/**
 * AI Resume Analyzer
 */
async function analyzeResume(resumeText) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Analyze this candidate resume:
        ${resumeText}

        Calculate:
        - overall_score (0-100)
        - ats_compatibility (0-100)
        - extracted_skills (JSON array of strings)
        - missing_skills (JSON array of strings representing popular industry skills in their domain not seen here)
        - suggestions (JSON array of strings with detailed, actionable resume improve suggestions)

        Return ONLY raw JSON matching these keys.`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          overall_score: { type: "INTEGER" },
          ats_compatibility: { type: "INTEGER" },
          extracted_skills: { type: "ARRAY", items: { type: "STRING" } },
          missing_skills: { type: "ARRAY", items: { type: "STRING" } },
          suggestions: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["overall_score", "ats_compatibility", "extracted_skills", "missing_skills", "suggestions"]
      };

      const result = await callGemini(prompt, responseSchema);
      return JSON.parse(result);
    } catch (e) {
      console.warn('Gemini resume analysis failed, falling back to local simulation:', e.message);
    }
  }

  // Heuristic Resume Analyzer
  const cleanText = resumeText.toLowerCase();
  const skillPool = ['java', 'python', 'javascript', 'html', 'css', 'react', 'node', 'express', 'sql', 'postgres', 'docker', 'kubernetes', 'aws', 'spring boot', 'git', 'ci/cd', 'typescript', 'c++', 'redis', 'graphql'];
  
  const extracted = [];
  skillPool.forEach(s => {
    if (cleanText.includes(s)) {
      // Format nicely
      if (s === 'html' || s === 'css') extracted.push(s.toUpperCase());
      else if (s === 'aws' || s === 'sql' || s === 'git') extracted.push(s.toUpperCase());
      else extracted.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  });

  if (extracted.length === 0) {
    // Seed standard ones if empty text
    extracted.push('Java', 'SQL', 'Git', 'REST API', 'JavaScript', 'HTML/CSS');
  }

  const allMissing = ['Spring Boot', 'AWS', 'Docker', 'Kubernetes', 'Redis', 'CI/CD', 'TypeScript'].filter(s => !extracted.includes(s));
  const missing = allMissing.slice(0, 3);

  const suggestions = [
    "Quantify your results (e.g. 'Improved API response times by 30% using Redis caching').",
    "Add more industry-standard keywords like " + (missing[0] || 'CI/CD') + " to improve search engine parser discoverability.",
    "Detail your cloud infrastructure setup and CI/CD pipelines to showcase full stack versatility."
  ];

  const score = Math.min(95, 60 + (extracted.length * 4));
  const ats = Math.min(92, 55 + (extracted.length * 3) + 10);

  return {
    overall_score: score,
    ats_compatibility: ats,
    extracted_skills: extracted,
    missing_skills: missing,
    suggestions: suggestions
  };
}

/**
 * Analyze Job Matches
 */
async function analyzeJobMatch(jobText, resumeText) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Compare this resume against the job description:
        Job Description: ${jobText}
        Resume: ${resumeText}

        Identify:
        - match_score: Compatibility percentage (0-100)
        - matched_skills: Array of skills matching both documents
        - missing_skills: Key technical/soft skills required by the job but missing in the resume
        - suggestions: Resume customization advice for this job

        Return ONLY a raw JSON object.`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          match_score: { type: "INTEGER" },
          matched_skills: { type: "ARRAY", items: { type: "STRING" } },
          missing_skills: { type: "ARRAY", items: { type: "STRING" } },
          suggestions: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["match_score", "matched_skills", "missing_skills", "suggestions"]
      };

      const result = await callGemini(prompt, responseSchema);
      return JSON.parse(result);
    } catch (e) {
      console.warn('Gemini job matching failed, falling back to local simulation:', e.message);
    }
  }

  // Local simulation matching
  const cleanJob = jobText.toLowerCase();
  const cleanRes = resumeText.toLowerCase();
  const skillPool = ['java', 'spring', 'python', 'django', 'javascript', 'react', 'node', 'sql', 'postgres', 'docker', 'kubernetes', 'aws', 'git', 'typescript', 'c++'];

  const matched = [];
  const missing = [];

  skillPool.forEach(s => {
    const inJob = cleanJob.includes(s);
    const inRes = cleanRes.includes(s);

    if (inJob && inRes) {
      matched.push(s.toUpperCase());
    } else if (inJob && !inRes) {
      missing.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  });

  // Seed default if empty
  if (matched.length === 0) matched.push('JAVA', 'SQL', 'GIT');
  if (missing.length === 0) missing.push('Spring Boot', 'AWS', 'Docker');

  const match_score = Math.max(45, Math.min(95, Math.round((matched.length / (matched.length + missing.length || 1)) * 100)));

  return {
    match_score,
    matched_skills: matched,
    missing_skills: missing,
    suggestions: [
      `Customize your profile statement to highlight your experience in ${matched.slice(0, 2).join(', ')}.`,
      `Add a projects bullet point demonstrating utilization of ${missing.slice(0, 2).join(', ')} to show immediate stack competency.`,
      `Highlight scaling or system design experience, which matches key job responsibilities.`
    ]
  };
}

module.exports = {
  generateQuestions,
  evaluateAnswer,
  analyzeResume,
  analyzeJobMatch
};
