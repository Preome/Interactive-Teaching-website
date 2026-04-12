const mongoose = require('mongoose');

// Schema for interactive items within an interactive article
const interactiveItemSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        default: '📝'
    },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio'],
        default: 'text'
    },
    explanation: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    mediaFileName: {
        type: String,
        default: ''
    },
    position: {
        type: Number,
        default: 0
    }
});

// Schema for each element in the content
const elementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'youtube', 'interactive_text'],
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    },
    interactiveElements: [interactiveItemSchema],
    order: {
        type: Number,
        default: 0
    }
});

// Main content schema
const contentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['microsoft_word', 'excel', 'powerpoint', 'internet', 'bangla_article', 'english_article', 'math', 'science', 'history', 'geography', 'bangla', 'english', 'physics', 'chemistry', 'biology', 'programming', 'database', 'economics', 'civics', 'news_article', 'interactive_story', 'other']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contentType: {
        type: String,
        enum: ['standard', 'interactive_article'],
        default: 'standard'
    },
    elements: [elementSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Content', contentSchema);