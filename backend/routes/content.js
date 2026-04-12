const express = require('express');
const Content = require('../models/Content');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Upload content (teacher only)
router.post('/upload', authMiddleware, upload.array('media', 20), async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can upload content' });
        }
        
        const { subject, title, description, elements, contentType } = JSON.parse(req.body.data);
        
        const uploadedElements = [...elements];
        
        if (req.files && req.files.length > 0) {
            let fileIndex = 0;
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if ((element.type === 'image' || element.type === 'video' || element.type === 'audio') && fileIndex < req.files.length) {
                    const file = req.files[fileIndex];
                    element.url = file.path;
                    element.content = file.originalname;
                    fileIndex++;
                }
            }
        }
        
        const content = new Content({
            subject,
            title,
            description,
            teacherId: req.userId,
            elements: uploadedElements,
            contentType: contentType || 'standard'
        });
        
        await content.save();
        res.status(201).json(content);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update content (teacher only)
router.put('/update/:id', authMiddleware, upload.array('media', 20), async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can update content' });
        }
        
        const { subject, title, description, elements, contentType } = JSON.parse(req.body.data);
        const uploadedElements = [...elements];
        
        if (req.files && req.files.length > 0) {
            let fileIndex = 0;
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if ((element.type === 'image' || element.type === 'video' || element.type === 'audio') && fileIndex < req.files.length) {
                    const file = req.files[fileIndex];
                    element.url = file.path;
                    element.content = file.originalname;
                    fileIndex++;
                }
            }
        }
        
        const content = await Content.findByIdAndUpdate(
            req.params.id,
            {
                subject,
                title,
                description,
                elements: uploadedElements,
                contentType: contentType || 'standard'
            },
            { new: true }
        );
        
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        res.json(content);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete content (teacher only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can delete content' });
        }
        
        const content = await Content.findByIdAndDelete(req.params.id);
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all content (filter by subject)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.query;
        const filter = {};
        if (subject && subject !== 'all') filter.subject = subject;
        
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