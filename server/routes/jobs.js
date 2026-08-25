const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

/**
 * @route POST /api/jobs/analyze
 */
router.post('/analyze', authenticate, async (req, res) => {
  const { job_title, company, raw_text } = req.body;

  if (!raw_text || !job_title) {
    return res.status(400).json({ error: 'Please provide job title and raw text of the description' });
  }

  try {
    // Save job description
    const jobResult = await db.run(
      'INSERT INTO job_descriptions (user_id, job_title, company, raw_text) VALUES (?, ?, ?, ?)',
      [req.user.id, job_title, company || '', raw_text]
    );
    const jobId = jobResult.lastID;

    // Fetch latest resume or profile skills to compare
    const latestResume = await db.get(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
      [req.user.id]
    );

    let profileSkills = [];
    const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (profile && profile.skills) {
      try {
        profileSkills = JSON.parse(profile.skills);
      } catch (e) {
        profileSkills = [];
      }
    }

    let comparisonText = `Preferred Role: ${job_title}\nSkills: ${profileSkills.join(', ')}`;
    if (latestResume) {
      const analysis = await db.get('SELECT * FROM resume_analysis WHERE resume_id = ?', [latestResume.id]);
      if (analysis && analysis.extracted_skills) {
        try {
          const resSkills = JSON.parse(analysis.extracted_skills);
          comparisonText += `\nResume Skills: ${resSkills.join(', ')}`;
        } catch (e) {}
      }
    }

    // Call AI to match compatibility
    const analysisResult = await aiService.analyzeJobMatch(raw_text, comparisonText);

    // Update job description with extracted skills and match score
    await db.run(
      'UPDATE job_descriptions SET extracted_skills = ?, match_score = ? WHERE id = ?',
      [JSON.stringify(analysisResult.matched_skills), analysisResult.match_score, jobId]
    );

    res.json({
      id: jobId,
      job_title,
      company,
      match_score: analysisResult.match_score,
      matched_skills: analysisResult.matched_skills,
      missing_skills: analysisResult.missing_skills,
      suggestions: analysisResult.suggestions
    });
  } catch (err) {
    console.error('Job analysis error:', err);
    res.status(500).json({ error: 'Server error analyzing job description' });
  }
});

module.exports = router;
