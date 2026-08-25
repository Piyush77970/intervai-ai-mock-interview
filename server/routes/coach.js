const express = require('express');
const router = express.Router();
const https = require('https');
const { authenticate } = require('../middleware/auth');

// Helper to query Gemini API directly
function queryCoachGemini(message, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: `You are IntervAI Coach, a professional career advisor and mock interviewer. Answer the user's career preparation question concisely and constructively:\n\nQuestion: ${message}\n\nHelpful advice:` }] }]
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
          if (parsed.candidates && parsed.candidates[0].content.parts[0].text) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('Invalid response'));
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

/**
 * @route POST /api/coach/chat
 * Conversations with the AI career coach
 */
router.post('/chat', authenticate, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Please enter a message' });
  }

  // Active Gemini LLM mode
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await queryCoachGemini(message, process.env.GEMINI_API_KEY);
      return res.json({ reply: response });
    } catch (e) {
      console.warn('Gemini coach request failed, falling back to local coach simulation:', e.message);
    }
  }

  // Rule-based career advisor simulator
  const promptLower = message.toLowerCase();
  let reply = '';

  if (promptLower.includes('java')) {
    reply = "For Java Developer interviews, you should be fully prepared to explain: \n\n1. **JVM Memory Structure**: Eden, Survivor, Old heap spaces and GC sweeps.\n2. **HashMap collisions**: JDK 8 tree-fying list colliders above threshold 8.\n3. **Multithreading concurrency**: ReentrantLock vs Synchronized, ExecutorServices, and ThreadPool tuning.\n\nTry running a technical Java Mock Interview on our Practice room to test your response scores.";
  } else if (promptLower.includes('resume') || promptLower.includes('ats')) {
    reply = "Resumes parse compatibility is highly dependent on formatting. To improve your ATS score: \n\n1. Use clean heading hierarchies.\n2. Highlight measurable numbers (e.g. 'boosted speeds by 30%').\n3. Use our Resume Analyzer tool in the sidebar; upload your PDF to see missing keywords immediately.";
  } else if (promptLower.includes('communication') || promptLower.includes('voice') || promptLower.includes('pauses')) {
    reply = "To improve your communication delivery in interviews: \n\n1. Use the STAR method to structure behavioral answers (Situation, Task, Action, Result).\n2. Avoid filler words like 'like', 'uh', 'you know' by pausing briefly before making key technical definitions.\n3. Try our Voice or Video practice modes on IntervAI to record, replay, and review your delivery speed.";
  } else if (promptLower.includes('study plan') || promptLower.includes('roadmap') || promptLower.includes('schedule')) {
    reply = "A great prep schedule follows a 4-week cycle:\n\n- **Week 1**: Core theoretical foundations (OOP, Data Structures, DB indices).\n- **Week 2**: Coding practice (Binary Search, Array reversals, standard algorithmic complexities).\n- **Week 3**: System design basics (Caching, vertical/horizontal scaling, REST principles).\n- **Week 4**: Behavioral STAR prep and mock practice iterations.\n\nCheck your personalized Learning Roadmap page to see weakness topics auto-generated from your interview answers!";
  } else {
    reply = "Hello! I am IntervAI Career Coach. I can help you prepare study roadmaps, review technical concepts (like Java JVM or Python decorator scopes), or advise you on resume optimization. \n\nWhat topic would you like to prepare today?";
  }

  res.json({ reply });
});

module.exports = router;
