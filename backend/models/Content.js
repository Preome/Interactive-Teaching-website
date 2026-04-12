const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['microsoft_word', 'excel', 'powerpoint', 'internet', 'bangla_article', 'english_article', 'math', 'science', 'history', 'geography', 'other']
    },
    title: {
        type: String,
        required: true
    },
    description: String,
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
    elements: [{
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio', 'youtube', 'interactive_text'],
            required: true
        },
        content: String,
        url: String,
        interactiveElements: [{
            emoji: String,
            word: String,
            explanation: String,
            position: Number
        }],
        order: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Content', contentSchema);