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
        
        const uploadedElements = JSON.parse(JSON.stringify(elements));
        let fileIndex = 0;
        
        if (req.files && req.files.length > 0) {
            // Handle regular media
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'image' || element.type === 'video' || element.type === 'audio') {
                    if (fileIndex < req.files.length) {
                        element.url = req.files[fileIndex].path;
                        element.content = req.files[fileIndex].originalname;
                        fileIndex++;
                    }
                }
            }
            
            // Handle interactive_text elements
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'interactive_text' && element.interactiveElements) {
                    for (let j = 0; j < element.interactiveElements.length; j++) {
                        const item = element.interactiveElements[j];
                        if (item.mediaType !== 'text' && fileIndex < req.files.length) {
                            const file = req.files[fileIndex];
                            item.mediaUrl = file.path;
                            item.mediaFileName = file.originalname;
                            fileIndex++;
                        }
                    }
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

// Get all content
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
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid content ID format' });
        }
        
        const content = await Content.findById(req.params.id).populate('teacherId', 'name');
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        res.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update content
router.put('/update/:id', authMiddleware, upload.array('media', 20), async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can update content' });
        }
        
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid content ID format' });
        }
        
        const { subject, title, description, elements, contentType } = JSON.parse(req.body.data);
        const uploadedElements = JSON.parse(JSON.stringify(elements));
        let fileIndex = 0;
        
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'image' || element.type === 'video' || element.type === 'audio') {
                    if (fileIndex < req.files.length) {
                        element.url = req.files[fileIndex].path;
                        fileIndex++;
                    }
                }
            }
            
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'interactive_text' && element.interactiveElements) {
                    for (let j = 0; j < element.interactiveElements.length; j++) {
                        const item = element.interactiveElements[j];
                        if (item.mediaType !== 'text' && fileIndex < req.files.length) {
                            item.mediaUrl = req.files[fileIndex].path;
                            fileIndex++;
                        }
                    }
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

// Delete content
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can delete content' });
        }
        
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid content ID format' });
        }
        
        const content = await Content.findByIdAndDelete(req.params.id);
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;