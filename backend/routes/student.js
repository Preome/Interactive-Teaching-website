const express = require('express');
const StudentWork = require('../models/StudentWork');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Save student's annotated work
router.post('/save-work', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'student') {
            return res.status(403).json({ error: 'Only students can save work' });
        }
        
        const { contentId, annotatedContent } = req.body;
        
        const work = new StudentWork({
            studentId: req.userId,
            contentId,
            annotatedContent
        });
        
        await work.save();
        res.status(201).json(work);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student's work history
router.get('/my-work', authMiddleware, async (req, res) => {
    try {
        const works = await StudentWork.find({ studentId: req.userId })
            .populate('contentId')
            .sort('-createdAt');
        res.json(works);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;