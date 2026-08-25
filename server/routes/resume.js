const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.doc' && ext !== '.docx' && ext !== '.txt') {
      return cb(new Error('Only PDF, DOC, DOCX or TXT files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/resume/upload
 */
router.post('/upload', authenticate, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a resume file' });
  }

  try {
    // Save to resumes table
    const result = await db.run(
      'INSERT INTO resumes (user_id, filename, file_path) VALUES (?, ?, ?)',
      [req.user.id, req.file.originalname, req.file.path]
    );

    res.status(201).json({
      id: result.lastID,
      filename: req.file.originalname,
      message: 'Resume uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error uploading resume' });
  }
});

/**
 * @route POST /api/resume/analyze
 */
router.post('/analyze', authenticate, async (req, res) => {
  try {
    // Find latest resume
    const latestResume = await db.get(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
      [req.user.id]
    );

    if (!latestResume) {
      return res.status(400).json({ error: 'No resume found. Please upload one first.' });
    }

    // Read resume text (simulated since full PDF reading needs external binary dependencies)
    // We will extract simple metadata or simulate a rich analysis from filename / profile
    const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    
    let resumeContent = `Candidate Resume Profile:\nName: ${req.user.email}\n`;
    if (profile) {
      resumeContent += `Preferred Role: ${profile.preferred_role}\nEducation: ${profile.education}\nSkills: ${profile.skills}\nExperience: ${profile.experience_years} years`;
    }

    // Call AI Resume analyzer
    const analysis = await aiService.analyzeResume(resumeContent);

    // Save to resume_analysis
    await db.run(
      `INSERT OR REPLACE INTO resume_analysis (resume_id, overall_score, ats_compatibility, extracted_skills, missing_skills, suggestions) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        latestResume.id,
        analysis.overall_score,
        analysis.ats_compatibility,
        JSON.stringify(analysis.extracted_skills),
        JSON.stringify(analysis.missing_skills),
        JSON.stringify(analysis.suggestions)
      ]
    );

    // Give user 100 XP for completing a resume analysis!
    if (profile) {
      const newXp = (profile.xp || 0) + 100;
      const newLevel = Math.floor(newXp / 500) + 1;
      await db.run('UPDATE profiles SET xp = ?, level = ? WHERE user_id = ?', [newXp, newLevel, req.user.id]);
    }

    res.json({
      resume_id: latestResume.id,
      filename: latestResume.filename,
      ...analysis
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Server error analyzing resume' });
  }
});

/**
 * @route GET /api/resume
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const resume = await db.get(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
      [req.user.id]
    );

    if (!resume) {
      return res.json({ resume: null, analysis: null });
    }

    const analysis = await db.get(
      'SELECT * FROM resume_analysis WHERE resume_id = ?',
      [resume.id]
    );

    if (analysis) {
      try {
        analysis.extracted_skills = JSON.parse(analysis.extracted_skills);
        analysis.missing_skills = JSON.parse(analysis.missing_skills);
        analysis.suggestions = JSON.parse(analysis.suggestions);
      } catch (e) {
        // Fallback
      }
    }

    res.json({ resume, analysis });
  } catch (err) {
    console.error('Error fetching resume data:', err);
    res.status(500).json({ error: 'Server error fetching resume details' });
  }
});

module.exports = router;
