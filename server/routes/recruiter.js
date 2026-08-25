const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route GET /api/recruiter/candidates
 * Retrieve candidate profiles who took mock interviews
 */
router.get('/candidates', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const list = await db.all(
      `SELECT u.id, u.name, u.email, i.role, i.type, i.overall_score, i.created_at as interview_date, i.id as interview_id
       FROM users u
       JOIN interviews i ON u.id = i.user_id
       WHERE i.status = "completed"
       ORDER BY i.overall_score DESC`
    );
    res.json(list);
  } catch (err) {
    console.error('Recruiter candidates error:', err);
    res.status(500).json({ error: 'Server error loading recruiter candidate lists' });
  }
});

/**
 * @route POST /api/recruiter/jobs
 * Create job description templates for matching
 */
router.post('/jobs', authenticate, authorize('recruiter'), async (req, res) => {
  const { title, description, template_settings } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Please provide job title and description text' });
  }

  try {
    // Find recruiter org
    const recObj = await db.get('SELECT organization_id FROM recruiters WHERE user_id = ?', [req.user.id]);
    const orgId = recObj ? recObj.organization_id : 1; // default fallback to seed org

    const result = await db.run(
      'INSERT INTO jobs (organization_id, title, description, template_settings) VALUES (?, ?, ?, ?)',
      [orgId, title, description, JSON.stringify(template_settings || {})]
    );

    res.status(201).json({
      id: result.lastID,
      title,
      message: 'Job posting template created successfully'
    });
  } catch (err) {
    console.error('Recruiter job create error:', err);
    res.status(500).json({ error: 'Server error creating recruiter job listing' });
  }
});

module.exports = router;
