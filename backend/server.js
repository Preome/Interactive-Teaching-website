const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Check if .env loaded properly
console.log('🔍 Checking environment variables...');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
    connectDB();
} else {
    console.warn('⚠️ Warning: MONGODB_URI not found. Running without database.');
}

// Routes - Make sure all routes are properly required
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/student', require('./routes/student'));
app.use('/api/quiz', require('./routes/quiz'));

// Gemini route - Make sure the file exists and exports correctly
try {
    const geminiRoutes = require('./routes/gemini');
    app.use('/api/gemini', geminiRoutes);
    console.log('✅ Gemini routes loaded successfully');
} catch (error) {
    console.error('❌ Failed to load Gemini routes:', error.message);
}

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Interactive Classroom API is running!',
        database: process.env.MONGODB_URI ? '✅ Connected' : '❌ Not configured',
        gemini: process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured',
        endpoints: {
            auth: '/api/auth (login, signup)',
            content: '/api/content (upload, get, update, delete)',
            student: '/api/student (save work, get work)',
            quiz: '/api/quiz (create, take, results)',
            gemini: '/api/gemini (chat, evaluate)'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
});