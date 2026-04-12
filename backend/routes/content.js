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
        
        console.log('=== UPLOAD DEBUG ===');
        console.log('Request body data:', req.body.data);
        const { subject, title, description, elements } = JSON.parse(req.body.data);
        
        console.log('Files uploaded:', req.files ? req.files.length : 0);
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                console.log(`File ${index}:`, { originalname: file.originalname, path: file.path, mimetype: file.mimetype });
            });
        }
        
        // Process uploaded files and match them with elements
        const uploadedElements = [...elements];
        
        if (req.files && req.files.length > 0) {
            let fileIndex = 0;
            
            // Go through elements and assign URLs to media elements
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                
                // If this is a media element (image, video, audio) and we have files left
                if ((element.type === 'image' || element.type === 'video' || element.type === 'audio') && fileIndex < req.files.length) {
                    const file = req.files[fileIndex];
                    element.url = file.path; // Cloudinary URL
                    element.content = file.originalname;
                    console.log(`Assigned URL to ${element.type}: ${element.url}`);
                    fileIndex++;
                }
            }
        }
        
        console.log('Final elements:', uploadedElements.map(e => ({ type: e.type, hasUrl: !!e.url, url: e.url })));
        
        const content = new Content({
            subject,
            title,
            description,
            teacherId: req.userId,
            elements: uploadedElements
        });
        
        await content.save();
        console.log('Content saved with ID:', content._id);
        res.status(201).json(content);
    } catch (error) {
        console.error('Upload error:', error);
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

module.exports = router;