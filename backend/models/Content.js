const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        enum: ['microsoft_word', 'excel', 'powerpoint', 'internet', 'other']
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
    elements: [{
        type: {
            type: String,
            enum: ['text', 'image', 'video', 'audio', 'youtube'],
            required: true
        },
        content: String,
        url: String,
        order: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Content', contentSchema);