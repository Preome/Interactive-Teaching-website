const express = require('express');
const Content = require('../models/Content');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Upload content (teacher only)
router.post('/upload', authMiddleware, upload.array('media', 10), async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can upload content' });
        }
        
        const { subject, title, description, elements } = JSON.parse(req.body.data);
        
        // Process uploaded files
        const uploadedElements = [...elements];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const fileType = file.mimetype.startsWith('image') ? 'image' : 
                                file.mimetype.startsWith('video') ? 'video' : 'audio';
                uploadedElements.push({
                    type: fileType,
                    url: file.path,
                    content: file.originalname,
                    order: elements.length + index
                });
            });
        }
        
        const content = new Content({
            subject,
            title,
            description,
            teacherId: req.userId,
            elements: uploadedElements
        });
        
        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all content (filter by subject)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.query;
        const filter = {};
        if (subject) filter.subject = subject;
        
        const contents = await Content.find(filter).populate('teacherId', 'name').sort('-createdAt');
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single content
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const content = await Content.findById(req.params.id).populate('teacherId', 'name');
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;