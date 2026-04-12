const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, code, language } = req.body;
        
        const prompt = `You are a helpful coding tutor. 
        Code: ${code || 'No code'}
        Question: ${message}
        Language: ${language || 'JavaScript'}
        
        Provide helpful guidance. Keep responses concise.`;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        const text = response.data.candidates[0].content.parts[0].text;
        res.json({ response: text });
    } catch (error) {
        console.error('Gemini error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get response', details: error.message });
    }
});

module.exports = router;