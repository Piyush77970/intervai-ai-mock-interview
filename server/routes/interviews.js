const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

/**
 * @route POST /api/interviews
 * Create a new mock interview session and generate questions
 */
router.post('/', authenticate, async (req, res) => {
  const { role, experience_level, type, difficulty, duration_minutes, mode } = req.body;

  if (!role || !experience_level || !type || !difficulty || !mode) {
    return res.status(400).json({ error: 'Please fill in all configuration fields' });
  }

  try {
    // 1. Fetch latest resume or profile context for personalization
    const latestResume = await db.get(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
      [req.user.id]
    );

    let resumeText = '';
    if (latestResume) {
      const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
      if (profile) {
        resumeText = `Skills: ${profile.skills}. Educations: ${profile.education}. Years of Exp: ${profile.experience_years}`;
      }
    }

    // 2. Generate questions using AI Service
    const questions = await aiService.generateQuestions({
      role,
      experience_level,
      type,
      difficulty,
      resumeText,
      jobDescription: ''
    });

    // 3. Create interview in database
    const interviewResult = await db.run(
      `INSERT INTO interviews (user_id, role, experience_level, type, difficulty, duration_minutes, mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [req.user.id, role, experience_level, type, difficulty, duration_minutes || 15, mode]
    );
    const interviewId = interviewResult.lastID;

    // 4. Save generated questions to interview_questions table
    for (let i = 0; i < questions.length; i++) {
      await db.run(
        `INSERT INTO interview_questions (interview_id, question_text, expected_concepts, sort_order) 
         VALUES (?, ?, ?, ?)`,
        [
          interviewId,
          questions[i].question_text,
          JSON.stringify(questions[i].expected_concepts || []),
          i + 1
        ]
      );
    }

    // Retrieve full question list from DB to have IDs
    const dbQuestions = await db.all(
      'SELECT * FROM interview_questions WHERE interview_id = ? ORDER BY sort_order ASC',
      [interviewId]
    );

    res.status(201).json({
      id: interviewId,
      role,
      experience_level,
      type,
      difficulty,
      duration_minutes,
      mode,
      status: 'active',
      questions: dbQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        sort_order: q.sort_order
      }))
    });
  } catch (err) {
    console.error('Error starting interview:', err);
    res.status(500).json({ error: 'Server error initializing interview' });
  }
});

/**
 * @route GET /api/interviews
 * Fetch interview history for user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const list = await db.all(
      'SELECT * FROM interviews WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(list);
  } catch (err) {
    console.error('Error listing interviews:', err);
    res.status(500).json({ error: 'Server error fetching interview list' });
  }
});

/**
 * @route GET /api/interviews/:id
 * Retrieve full interview report & answer logs
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const interview = await db.get(
      'SELECT * FROM interviews WHERE id = ?',
      [req.params.id]
    );

    if (!interview) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    // Authorization check
    if (interview.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch questions
    const questions = await db.all(
      'SELECT * FROM interview_questions WHERE interview_id = ? ORDER BY sort_order ASC',
      [interview.id]
    );

    // Fetch answers and evaluations
    const answers = await db.all(
      `SELECT a.*, e.score, e.correctness, e.relevance, e.completeness, e.technical_depth, 
              e.communication, e.star_situation, e.star_task, e.star_action, e.star_result,
              e.feedback_positive, e.feedback_improve, e.feedback_missing, e.suggested_answer
       FROM answers a
       LEFT JOIN answer_evaluations e ON a.id = e.answer_id
       WHERE a.interview_id = ?`,
      [interview.id]
    );

    // Parse JSON arrays for questions/answers
    const formattedQuestions = questions.map(q => {
      try {
        q.expected_concepts = JSON.parse(q.expected_concepts || '[]');
      } catch (e) {
        q.expected_concepts = [];
      }
      return q;
    });

    res.json({
      interview,
      questions: formattedQuestions,
      answers
    });
  } catch (err) {
    console.error('Error retrieving interview:', err);
    res.status(500).json({ error: 'Server error fetching details' });
  }
});

/**
 * @route POST /api/interviews/:id/answer
 * Submit an answer to a question, trigger real-time AI scoring
 */
router.post('/:id/answer', authenticate, async (req, res) => {
  const { question_id, answer_text, audio_url, video_url, duration_seconds } = req.body;

  if (!question_id || !answer_text) {
    return res.status(400).json({ error: 'Question ID and answer text are required' });
  }

  try {
    const interview = await db.get('SELECT * FROM interviews WHERE id = ?', [req.params.id]);
    if (!interview || interview.status !== 'active') {
      return res.status(400).json({ error: 'Interview is not in active state' });
    }

    const question = await db.get('SELECT * FROM interview_questions WHERE id = ?', [question_id]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Save answer
    const answerResult = await db.run(
      `INSERT INTO answers (interview_id, question_id, answer_text, audio_url, video_url, duration_seconds) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, question_id, answer_text, audio_url || '', video_url || '', duration_seconds || 0]
    );
    const answerId = answerResult.lastID;

    // Evaluate answer via AI Service
    let expectedConcepts = [];
    try {
      expectedConcepts = JSON.parse(question.expected_concepts || '[]');
    } catch (e) {}

    const evalResult = await aiService.evaluateAnswer({
      question: question.question_text,
      expectedConcepts,
      answerText: answer_text,
      mode: interview.mode
    });

    // Save evaluation to DB
    await db.run(
      `INSERT INTO answer_evaluations (
        answer_id, score, correctness, relevance, completeness, technical_depth, communication,
        star_situation, star_task, star_action, star_result, feedback_positive, feedback_improve,
        feedback_missing, suggested_answer
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        answerId,
        evalResult.score,
        evalResult.correctness,
        evalResult.relevance,
        evalResult.completeness,
        evalResult.technical_depth,
        evalResult.communication,
        evalResult.star_situation,
        evalResult.star_task,
        evalResult.star_action,
        evalResult.star_result,
        evalResult.feedback_positive,
        evalResult.feedback_improve,
        evalResult.feedback_missing,
        evalResult.suggested_answer
      ]
    );

    res.status(201).json({
      answer_id: answerId,
      evaluation: evalResult
    });
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ error: 'Server error processing answer evaluation' });
  }
});

/**
 * @route POST /api/interviews/:id/complete
 * Finish interview session, aggregate overall score, create feedback loops
 */
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const interview = await db.get('SELECT * FROM interviews WHERE id = ?', [req.params.id]);
    if (!interview || interview.status !== 'active') {
      return res.status(400).json({ error: 'Interview is already completed or invalid' });
    }

    // Fetch all evaluations for this interview
    const evals = await db.all(
      `SELECT e.*, q.question_text, q.expected_concepts 
       FROM answer_evaluations e
       JOIN answers a ON e.answer_id = a.id
       JOIN interview_questions q ON a.question_id = q.id
       WHERE a.interview_id = ?`,
      [interview.id]
    );

    let avgScore = 0;
    let feedbackSummary = 'Practice completed.';
    let weakTopics = [];

    if (evals.length > 0) {
      const sum = evals.reduce((acc, curr) => acc + curr.score, 0);
      avgScore = parseFloat((sum / evals.length).toFixed(1)) * 10; // Convert 0-10 back to 0-100 scale

      // Identify weaknesses (score < 7 out of 10)
      evals.forEach(ev => {
        if (ev.score < 7.5 && ev.feedback_missing) {
          weakTopics.push({
            topic: ev.feedback_missing.split(',')[0] || 'Core Concepts',
            action: ev.feedback_improve || 'Review expected architectural concepts.'
          });
        }
      });

      feedbackSummary = evals.map(ev => ev.feedback_positive).slice(0, 2).join(' ') + 
        ' Focus on improving ' + (weakTopics.map(w => w.topic).slice(0, 2).join(', ') || 'technical depth') + '.';
    }

    // Update interview status & score
    await db.run(
      'UPDATE interviews SET status = ?, overall_score = ?, feedback_summary = ? WHERE id = ?',
      ['completed', avgScore, feedbackSummary, interview.id]
    );

    // 1. Update candidate XP and Level (150 XP for completing interview)
    const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (profile) {
      const currentStreak = (profile.streak_days || 0) + 1;
      const currentXp = (profile.xp || 0) + 150;
      const level = Math.floor(currentXp / 500) + 1;

      await db.run(
        'UPDATE profiles SET xp = ?, level = ?, streak_days = ?, last_active_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [currentXp, level, currentStreak, req.user.id]
      );
    }

    // 2. Generate roadmap learning steps based on identified weaknesses
    if (weakTopics.length > 0) {
      // Clear previous uncompleted roadmaps and add new actions
      await db.run("DELETE FROM learning_plans WHERE user_id = ? AND status = 'pending'", [req.user.id]);
      
      for (let i = 0; i < Math.min(3, weakTopics.length); i++) {
        await db.run(
          `INSERT INTO learning_plans (user_id, weakness_topic, suggested_action, week_number, status) 
           VALUES (?, ?, ?, ?, 'pending')`,
          [req.user.id, weakTopics[i].topic, weakTopics[i].action, i + 1]
        );
      }
    }

    // 3. Create completion notification
    await db.run(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, 'Interview Completed!', ?, 'score')`,
      [req.user.id, `Congratulations on finishing your ${interview.role} interview. Overall Score: ${avgScore}/100.`]
    );

    res.json({
      id: interview.id,
      status: 'completed',
      overall_score: avgScore,
      feedback_summary: feedbackSummary,
      weaknesses: weakTopics
    });
  } catch (err) {
    console.error('Error completing interview:', err);
    res.status(500).json({ error: 'Server error finalizing interview session' });
  }
});

module.exports = router;
