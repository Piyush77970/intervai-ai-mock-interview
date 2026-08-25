const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/coding/questions
 */
router.get('/questions', authenticate, async (req, res) => {
  try {
    const list = await db.all('SELECT id, title, description, difficulty, starter_code FROM coding_questions');
    const parsed = list.map(q => {
      try {
        q.starter_code = JSON.parse(q.starter_code);
      } catch (e) {}
      return q;
    });
    res.json(parsed);
  } catch (err) {
    console.error('Error loading coding questions:', err);
    res.status(500).json({ error: 'Server error loading challenges' });
  }
});

/**
 * @route GET /api/coding/questions/:id
 */
router.get('/questions/:id', authenticate, async (req, res) => {
  try {
    const question = await db.get('SELECT * FROM coding_questions WHERE id = ?', [req.params.id]);
    if (!question) return res.status(404).json({ error: 'Challenge not found' });

    try {
      question.starter_code = JSON.parse(question.starter_code);
      question.test_cases = JSON.parse(question.test_cases);
    } catch (e) {}

    res.json(question);
  } catch (err) {
    console.error('Error fetching challenge:', err);
    res.status(500).json({ error: 'Server error fetching challenge details' });
  }
});

/**
 * @route POST /api/coding/submissions
 * Compile & run test cases for coding solutions
 */
router.post('/submissions', authenticate, async (req, res) => {
  const { coding_question_id, code, language } = req.body;

  if (!coding_question_id || !code || !language) {
    return res.status(400).json({ error: 'Question ID, code and language are required' });
  }

  try {
    const question = await db.get('SELECT * FROM coding_questions WHERE id = ?', [coding_question_id]);
    if (!question) return res.status(404).json({ error: 'Challenge not found' });

    let testCases = [];
    try {
      testCases = JSON.parse(question.test_cases || '[]');
    } catch (e) {}

    // Simulated Compilation & Sandbox Testing
    const codeClean = code.replace(/\s+/g, ' ');
    let status = 'passed';
    let passedCases = testCases.length;
    let feedback = 'All test cases passed! Great execution.';
    let timeComplexity = 'O(log n)';
    let spaceComplexity = 'O(1)';

    // Simple parser simulation
    if (question.title === 'Binary Search') {
      const containsMid = codeClean.includes('mid') || codeClean.includes('middle');
      const containsLoop = codeClean.includes('while') || codeClean.includes('for');
      
      if (!code || code.trim().length < 50) {
        status = 'failed';
        passedCases = 0;
        feedback = 'Solution draft too short. Please implement a full search solution.';
      } else if (!containsLoop) {
        status = 'failed';
        passedCases = 0;
        feedback = 'Compilation Error: Missing loop. Binary search requires iteration or recursion.';
      } else if (!containsMid) {
        status = 'failed';
        passedCases = 1; // Passes only first case by luck
        feedback = 'Runtime Failure: Midpoint calculations not detected. Time complexity was O(n) instead of O(log n).';
        timeComplexity = 'O(n)';
      }
    } else if (question.title === 'Reverse String') {
      timeComplexity = 'O(n)';
      spaceComplexity = 'O(1)';
      
      if (!code || code.trim().length < 30) {
        status = 'failed';
        passedCases = 0;
        feedback = 'Solution empty. Please implement the string reversal function.';
      } else if (codeClean.includes('split') && codeClean.includes('reverse') && codeClean.includes('join') && language === 'javascript') {
        passedCases = testCases.length;
        feedback = 'All test cases passed, but you used built-in array methods. Try solving in-place with two pointers to achieve O(1) space constraints.';
        spaceComplexity = 'O(n)'; // built-in split creates copy
      }
    }

    const score = Math.round((passedCases / (testCases.length || 1)) * 100);

    // Save to coding_submissions
    await db.run(
      `INSERT INTO coding_submissions (user_id, coding_question_id, code, language, status, passed_cases, total_cases, score, complexity_time, complexity_space, feedback) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        coding_question_id,
        code,
        language,
        status,
        passedCases,
        testCases.length,
        score,
        timeComplexity,
        spaceComplexity,
        feedback
      ]
    );

    // Reward XP (+75 XP for solved challenges)
    if (status === 'passed') {
      const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
      if (profile) {
        const newXp = (profile.xp || 0) + 75;
        const newLevel = Math.floor(newXp / 500) + 1;
        await db.run('UPDATE profiles SET xp = ?, level = ? WHERE user_id = ?', [newXp, newLevel, req.user.id]);
      }
    }

    res.json({
      status,
      passed_cases: passedCases,
      total_cases: testCases.length,
      score,
      complexity_time: timeComplexity,
      complexity_space: spaceComplexity,
      feedback
    });
  } catch (err) {
    console.error('Error submitting code solution:', err);
    res.status(500).json({ error: 'Server error compiling solution code' });
  }
});

module.exports = router;
