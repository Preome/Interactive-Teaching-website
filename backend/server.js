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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (only if URI exists)
if (process.env.MONGODB_URI) {
    connectDB();
} else {
    console.warn('⚠️ Warning: MONGODB_URI not found. Running without database.');
}

// Routes - Make sure all these files exist
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/student', require('./routes/student'));
// Add after other routes
app.use('/api/quiz', require('./routes/quiz'));

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Interactive Classroom API is running!',
        database: process.env.MONGODB_URI ? '✅ Connected' : '❌ Not configured',
        endpoints: {
            auth: '/api/auth (login, signup)',
            content: '/api/content (upload, get, update, delete)',
            student: '/api/student (save work, get work)'
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
    console.log(`📚 Available endpoints:`);
    console.log(`   POST   /api/auth/signup - Create account`);
    console.log(`   POST   /api/auth/login  - Login`);
    console.log(`   GET    /api/content/all - Get all content`);
    console.log(`   GET    /api/content/:id - Get single content`);
    console.log(`   POST   /api/content/upload - Upload content`);
    console.log(`   PUT    /api/content/update/:id - Update content`);
    console.log(`   DELETE /api/content/:id - Delete content`);
    console.log(`   POST   /api/student/save-work - Save student work`);
    console.log(`   GET    /api/student/my-work - Get student work`);
});