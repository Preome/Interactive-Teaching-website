import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const QuizTaker = ({ token, quiz, onClose, onComplete }) => {
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleAnswer = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const answerArray = quiz.questions.map((_, idx) => answers[idx] || '');
        
        try {
            const response = await api.post(``${API_URL}/api/quiz/submit/${quiz._id}`, {
                answers: answerArray,
                timeSpent: quiz.timeLimit > 0 ? (quiz.timeLimit * 60 - (timeLeft || 0)) : 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data);
            onComplete(response.data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Error submitting quiz: ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
                    <div className="text-center mb-6">
                        <div className={`text-6xl mb-3 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                            {result.passed ? '🎉' : '📚'}
                        </div>
                        <p className="text-3xl font-bold">{result.percentage}%</p>
                        <p className="text-gray-600 mt-2">
                            Score: {result.score} / {result.totalPoints}
                        </p>
                        {result.passed ? (
                            <p className="text-green-600 mt-2">Congratulations! You passed!</p>
                        ) : (
                            <p className="text-red-600 mt-2">Keep practicing! You can try again.</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">{quiz.title}</h2>
                        {timeLeft !== null && (
                            <div className="text-lg font-semibold">
                                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </p>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">{question.questionText}</h3>

                    {question.questionType === 'multiple_choice' && (
                        <div className="space-y-3">
                            {question.options.map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="question"
                                        value={opt.text}
                                        checked={answers[currentQuestion] === opt.text}
                                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span>{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {question.questionType === 'true_false' && (
                        <div className="space-y-3">
                            {question.options.map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="question"
                                        value={opt.text}
                                        checked={answers[currentQuestion] === opt.text}
                                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span>{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {question.questionType === 'fill_blank' && (
                        <input
                            type="text"
                            value={answers[currentQuestion] || ''}
                            onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Type your answer here..."
                        />
                    )}
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between">
                    <button
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        disabled={currentQuestion === 0}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600"
                    >
                        Previous
                    </button>
                    {currentQuestion < quiz.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizTaker;