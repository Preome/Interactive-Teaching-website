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
        const { subject, title, description, elements, contentType } = JSON.parse(req.body.data);
        
        console.log('Content Type:', contentType);
        console.log('Total files uploaded:', req.files?.length || 0);
        
        const uploadedElements = [...elements];
        
        // Separate files for regular media and interactive media
        let fileIndex = 0;
        
        if (req.files && req.files.length > 0) {
            console.log('Files available:', req.files.map(f => ({ name: f.originalname, path: f.path })));
            
            // First pass: Handle regular media elements (images, videos, audio)
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if ((element.type === 'image' || element.type === 'video' || element.type === 'audio') && fileIndex < req.files.length) {
                    const file = req.files[fileIndex];
                    element.url = file.path;
                    element.content = file.originalname;
                    console.log(`Assigned URL to regular ${element.type}: ${file.path}`);
                    fileIndex++;
                }
            }
            
            // Second pass: Handle interactive elements
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'interactive_text' && element.interactiveElements) {
                    for (let j = 0; j < element.interactiveElements.length; j++) {
                        const interactiveItem = element.interactiveElements[j];
                        // Check if this interactive item needs a media file
                        if (interactiveItem.mediaType !== 'text' && fileIndex < req.files.length) {
                            const file = req.files[fileIndex];
                            interactiveItem.mediaUrl = file.path;
                            interactiveItem.mediaFileName = file.originalname;
                            console.log(`Assigned interactive media URL to "${interactiveItem.word}": ${file.path}`);
                            fileIndex++;
                        }
                    }
                }
            }
        }
        
        console.log('Final elements summary:', uploadedElements.map(e => ({ 
            type: e.type, 
            interactiveCount: e.interactiveElements?.length || 0,
            interactiveItems: e.interactiveElements?.map(ie => ({ 
                word: ie.word, 
                mediaType: ie.mediaType,
                hasUrl: !!ie.mediaUrl 
            }))
        })));
        
        const content = new Content({
            subject,
            title,
            description,
            teacherId: req.userId,
            elements: uploadedElements,
            contentType: contentType || 'standard'
        });
        
        await content.save();
        console.log('Content saved with ID:', content._id);
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
        
        let fileIndex = 0;
        
        if (req.files && req.files.length > 0) {
            // Handle regular media elements
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if ((element.type === 'image' || element.type === 'video' || element.type === 'audio') && fileIndex < req.files.length) {
                    const file = req.files[fileIndex];
                    element.url = file.path;
                    element.content = file.originalname;
                    fileIndex++;
                }
            }
            
            // Handle interactive elements
            for (let i = 0; i < uploadedElements.length; i++) {
                const element = uploadedElements[i];
                if (element.type === 'interactive_text' && element.interactiveElements) {
                    for (let j = 0; j < element.interactiveElements.length; j++) {
                        const interactiveItem = element.interactiveElements[j];
                        if (interactiveItem.mediaType !== 'text' && fileIndex < req.files.length) {
                            const file = req.files[fileIndex];
                            interactiveItem.mediaUrl = file.path;
                            interactiveItem.mediaFileName = file.originalname;
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