const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    userAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number,
    pointsPossible: Number
});

const quizResultSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        required: true
    },
    totalPoints: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    passed: {
        type: Boolean,
        default: false
    },
    timeSpent: Number,
    attemptNumber: {
        type: Number,
        default: 1
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);