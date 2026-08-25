const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/profile
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const profile = await db.get(
      `SELECT u.name, u.email, u.role, p.* 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Parse skills JSON
    if (profile.skills) {
      try {
        profile.skills = JSON.parse(profile.skills);
      } catch (e) {
        profile.skills = [];
      }
    } else {
      profile.skills = [];
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

/**
 * @route PUT /api/profile
 */
router.put('/', authenticate, async (req, res) => {
  const { education, experience_years, preferred_role, skills, location, career_goals } = req.body;

  try {
    const skillsJSON = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]);

    await db.run(
      `UPDATE profiles SET 
        education = ?, 
        experience_years = ?, 
        preferred_role = ?, 
        skills = ?, 
        location = ?, 
        career_goals = ?,
        last_active_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        education || '',
        experience_years || 0,
        preferred_role || '',
        skillsJSON,
        location || '',
        career_goals || '',
        req.user.id
      ]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
