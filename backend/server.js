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

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://interactive-teaching-frontend.onrender.com',
    'https://interactive-teaching-website.onrender.com'
];

// CORS middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(null, true); // Allow all in development, change in production
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
    connectDB();
} else {
    console.warn('⚠️ Warning: MONGODB_URI not found. Running without database.');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/student', require('./routes/student'));
app.use('/api/quiz', require('./routes/quiz'));

// Gemini route
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Use PORT from environment variable - Render sets this automatically
const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 to accept connections from outside
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API URL: http://0.0.0.0:${PORT}`);
});