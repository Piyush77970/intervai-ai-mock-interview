const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_intervai_2026';

/**
 * @route POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const { name, email, password, preferred_role, education, experience_years } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }

  try {
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default role is candidate unless specified (for testing, e.g. recruiter flag)
    let role = 'candidate';
    if (email.toLowerCase().includes('.hr@') || email.toLowerCase().includes('recruiter@')) {
      role = 'recruiter';
    } else if (email.toLowerCase().includes('admin@intervai.com')) {
      role = 'admin';
    }

    // Insert user
    const userResult = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), passwordHash, role]
    );
    const userId = userResult.lastID;

    // Create profile
    const skillsJSON = JSON.stringify([]);
    await db.run(
      'INSERT INTO profiles (user_id, education, experience_years, preferred_role, skills, location, career_goals, xp, level, streak_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, education || '', experience_years || 0, preferred_role || '', skillsJSON, '', '', 0, 1, 0]
    );

    // Auto-subscribe candidate to Free plan
    const currentPeriodStart = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    const formattedEnd = currentPeriodEnd.toISOString().slice(0, 19).replace('T', ' ');

    await db.run(
      'INSERT INTO subscriptions (user_id, plan_id, status, billing_cycle, current_period_start, current_period_end) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 1, 'active', 'monthly', currentPeriodStart, formattedEnd]
    );

    // Create token
    const token = jwt.sign({ id: userId, email: email.toLowerCase(), role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * @route POST /api/auth/forgot-password
 */
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide email' });
  }
  // Simulated email recovery message
  res.json({ message: 'Password recovery email sent! Please check your inbox for reset instructions.' });
});

module.exports = router;
