const express = require('express');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create Quiz (Teacher only)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can create quizzes' });
        }

        const { title, description, subject, questions, timeLimit, passingScore, attemptsAllowed } = req.body;

        const quiz = new Quiz({
            title,
            description,
            subject,
            teacherId: req.userId,
            questions,
            timeLimit: timeLimit || 0,
            passingScore: passingScore || 70,
            attemptsAllowed: attemptsAllowed || 1,
            isActive: true
        });

        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all quizzes (filtered by subject)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.query;
        const filter = { isActive: true };
        if (subject && subject !== 'all') filter.subject = subject;
        
        const quizzes = await Quiz.find(filter).populate('teacherId', 'name').sort('-createdAt');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single quiz
router.get('/:quizId', authMiddleware, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('teacherId', 'name');
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit quiz answers (Student only)
router.post('/submit/:quizId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quizzes' });
        }

        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const { answers, timeSpent } = req.body;
        
        // Check attempts
        const existingAttempts = await QuizResult.countDocuments({
            quizId: req.params.quizId,
            studentId: req.userId
        });

        if (existingAttempts >= quiz.attemptsAllowed) {
            return res.status(400).json({ error: 'Maximum attempts reached' });
        }

        // Calculate score
        let totalPoints = 0;
        let earnedPoints = 0;
        const processedAnswers = [];

        quiz.questions.forEach((question, idx) => {
            const userAnswer = answers[idx];
            const pointsPossible = question.points || 1;
            totalPoints += pointsPossible;
            
            let isCorrect = false;
            let pointsEarned = 0;

            if (question.questionType === 'multiple_choice') {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && userAnswer === correctOption.text) {
                    isCorrect = true;
                    pointsEarned = pointsPossible;
                }
            } else if (question.questionType === 'true_false') {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && userAnswer === correctOption.text) {
                    isCorrect = true;
                    pointsEarned = pointsPossible;
                }
            } else if (question.questionType === 'fill_blank') {
                if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
                    isCorrect = true;
                    pointsEarned = pointsPossible;
                }
            }

            earnedPoints += pointsEarned;
            processedAnswers.push({
                questionId: question._id,
                questionText: question.questionText,
                userAnswer: userAnswer || '',
                isCorrect,
                pointsEarned,
                pointsPossible
            });
        });

        const percentage = (earnedPoints / totalPoints) * 100;
        const passed = percentage >= quiz.passingScore;

        const quizResult = new QuizResult({
            quizId: req.params.quizId,
            studentId: req.userId,
            answers: processedAnswers,
            score: earnedPoints,
            totalPoints: totalPoints,
            percentage: percentage,
            passed: passed,
            timeSpent: timeSpent || 0,
            attemptNumber: existingAttempts + 1
        });

        await quizResult.save();

        res.json({
            score: earnedPoints,
            totalPoints: totalPoints,
            percentage: percentage,
            passed: passed,
            resultId: quizResult._id
        });
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get student's quiz results
router.get('/results/my-results', authMiddleware, async (req, res) => {
    try {
        const results = await QuizResult.find({ studentId: req.userId })
            .populate('quizId')
            .sort('-completedAt');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get quiz results for a specific quiz (Teacher view)
router.get('/results/quiz/:quizId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can view all results' });
        }
        
        const results = await QuizResult.find({ quizId: req.params.quizId })
            .populate('studentId', 'name email')
            .sort('-percentage');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update quiz (Teacher only)
router.put('/update/:quizId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can update quizzes' });
        }

        const { title, description, subject, questions, timeLimit, passingScore, attemptsAllowed, isActive } = req.body;

        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            {
                title,
                description,
                subject,
                questions,
                timeLimit: timeLimit || 0,
                passingScore: passingScore || 70,
                attemptsAllowed: attemptsAllowed || 1,
                isActive
            },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete quiz (Teacher only)
router.delete('/:quizId', authMiddleware, async (req, res) => {
    try {
        if (req.userRole !== 'teacher') {
            return res.status(403).json({ error: 'Only teachers can delete quizzes' });
        }

        const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Also delete all results for this quiz
        await QuizResult.deleteMany({ quizId: req.params.quizId });

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;