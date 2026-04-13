const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'fill_blank'],
        default: 'multiple_choice'
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    correctAnswer: String, // For fill in the blank
    points: {
        type: Number,
        default: 1
    },
    order: Number
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    subject: {
        type: String,
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [questionSchema],
    timeLimit: {
        type: Number,
        default: 0 // 0 means no time limit
    },
    passingScore: {
        type: Number,
        default: 70 // percentage
    },
    attemptsAllowed: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now  
    }
});

module.exports = mongoose.model('Quiz', quizSchema);