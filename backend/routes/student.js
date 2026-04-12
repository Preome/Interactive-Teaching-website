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

// Update student's annotated work
router.put('/update-work/:workId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'student') {
            return res.status(403).json({ error: 'Only students can update their work' });
        }
        
        const { annotatedContent } = req.body;
        const work = await StudentWork.findOneAndUpdate(
            { _id: req.params.workId, studentId: req.userId },
            { annotatedContent, updatedAt: new Date() },
            { new: true }
        ).populate('contentId');
        
        if (!work) {
            return res.status(404).json({ error: 'Work not found' });
        }
        
        res.json(work);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gemini Practice for Programming subjects
router.post('/gemini-practice', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'student') {
            return res.status(403).json({ error: 'Only students can use Gemini practice' });
        }

        const { contentId, contentTitle, prompt } = req.body;
        if (!prompt?.trim()) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const fullPrompt = `You are a coding tutor. The student is practicing from lesson "${contentTitle}".

Student prompt: "${prompt}"

Create:
1. 2-3 practice coding problems (easy-medium)
2. Step-by-step hints (no direct answers)
3. Expected learning outcomes  
4. Format as HTML with proper styling
5. Keep educational and encouraging

Lesson context: [Content ID: ${contentId}]`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response.text();

        res.json({ response });
    } catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ error: 'AI service unavailable. Please try again.' });
    }
});

// Save student annotations for specific content (inline editing)
router.post('/save-annotations/:contentId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'student') {
            return res.status(403).json({ error: 'Only students can save annotations' });
        }
        
        const { annotatedContent } = req.body;
        
        let work = await StudentWork.findOne({ 
            studentId: req.userId, 
            contentId: req.params.contentId 
        }).populate('contentId');
        
        if (work) {
            // Update existing
            work.annotatedContent = annotatedContent;
            work.updatedAt = new Date();
            await work.save();
        } else {
            // Create new
            work = new StudentWork({
                studentId: req.userId,
                contentId: req.params.contentId,
                annotatedContent
            });
            await work.save();
        }
        
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