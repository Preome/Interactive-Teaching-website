import React, { useState } from 'react';
import axios from 'axios';

const QuizCreator = ({ token, onQuizCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('microsoft_word');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'multiple_choice',
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        correctAnswer: '',
        points: 1
    });
    const [timeLimit, setTimeLimit] = useState(0);
    const [passingScore, setPassingScore] = useState(70);
    const [attemptsAllowed, setAttemptsAllowed] = useState(1);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

    const subjects = [
        'microsoft_word', 'excel', 'powerpoint', 'internet',
        'bangla', 'english', 'math', 'science', 'history', 'geography', 'other'
    ];

    const subjectNames = {
        'microsoft_word': 'Microsoft Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'internet': 'Internet',
        'bangla': 'Bangla (Bengali)',
        'english': 'English',
        'math': 'Mathematics',
        'science': 'Science',
        'history': 'History',
        'geography': 'Geography',
        'other': 'Other Subjects'
    };

    const addOption = () => {
        setCurrentQuestion({
            ...currentQuestion,
            options: [...currentQuestion.options, { text: '', isCorrect: false }]
        });
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index][field] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const removeOption = (index) => {
        const newOptions = currentQuestion.options.filter((_, i) => i !== index);
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            alert('Please enter question text');
            return;
        }

        if (currentQuestion.questionType === 'multiple_choice') {
            const hasCorrect = currentQuestion.options.some(opt => opt.isCorrect);
            if (!hasCorrect) {
                alert('Please select at least one correct answer');
                return;
            }
            const hasEmpty = currentQuestion.options.some(opt => !opt.text.trim());
            if (hasEmpty) {
                alert('Please fill all option texts');
                return;
            }
        }

        if (currentQuestion.questionType === 'true_false') {
            const hasCorrect = currentQuestion.options.some(opt => opt.isCorrect);
            if (!hasCorrect) {
                alert('Please select the correct answer (True or False)');
                return;
            }
        }

        if (currentQuestion.questionType === 'fill_blank' && !currentQuestion.correctAnswer.trim()) {
            alert('Please enter the correct answer');
            return;
        }

        if (editingQuestionIndex !== null) {
            const newQuestions = [...questions];
            newQuestions[editingQuestionIndex] = currentQuestion;
            setQuestions(newQuestions);
            setEditingQuestionIndex(null);
        } else {
            setQuestions([...questions, { ...currentQuestion, order: questions.length }]);
        }

        setCurrentQuestion({
            questionText: '',
            questionType: 'multiple_choice',
            options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            correctAnswer: '',
            points: 1
        });
        setShowQuestionForm(false);
    };

    const editQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        setEditingQuestionIndex(index);
        setShowQuestionForm(true);
    };

    const removeQuestion = (index) => {
        if (window.confirm('Remove this question?')) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a quiz title');
            return;
        }

        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/quiz/create', {
                title,
                description,
                subject,
                questions,
                timeLimit,
                passingScore,
                attemptsAllowed
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Quiz created successfully!');
            setTitle('');
            setDescription('');
            setQuestions([]);
            setTimeLimit(0);
            setPassingScore(70);
            setAttemptsAllowed(1);
            onQuizCreated();
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Error creating quiz: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">📝 Create New Quiz</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Quiz Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            {subjects.map(s => (
                                <option key={s} value={s}>{subjectNames[s]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Time Limit (minutes)</label>
                        <input
                            type="number"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="0 = No limit"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Passing Score (%)</label>
                        <input
                            type="number"
                            value={passingScore}
                            onChange={(e) => setPassingScore(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border rounded-lg"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>

                {/* Questions Section */}
                <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Questions ({questions.length})</h3>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingQuestionIndex(null);
                                setCurrentQuestion({
                                    questionText: '',
                                    questionType: 'multiple_choice',
                                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                                    correctAnswer: '',
                                    points: 1
                                });
                                setShowQuestionForm(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            + Add Question
                        </button>
                    </div>

                    {/* Questions List */}
                    {questions.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {questions.map((q, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <span className="font-bold">Q{idx + 1}:</span> {q.questionText.substring(0, 100)}
                                        <span className="ml-2 text-xs text-gray-500">({q.points} pts)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => editQuestion(idx)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(idx)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add/Edit Question Form */}
                    {showQuestionForm && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold mb-3">
                                {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                            </h4>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Question Text</label>
                                <textarea
                                    value={currentQuestion.questionText}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                    rows="2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Type</label>
                                    <select
                                        value={currentQuestion.questionType}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            if (newType === 'true_false') {
                                                setCurrentQuestion({
                                                    ...currentQuestion,
                                                    questionType: newType,
                                                    options: [
                                                        { text: 'True', isCorrect: false },
                                                        { text: 'False', isCorrect: false }
                                                    ]
                                                });
                                            } else if (newType === 'fill_blank') {
                                                setCurrentQuestion({
                                                    ...currentQuestion,
                                                    questionType: newType,
                                                    options: [],
                                                    correctAnswer: ''
                                                });
                                            } else {
                                                setCurrentQuestion({
                                                    ...currentQuestion,
                                                    questionType: newType,
                                                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                                                    correctAnswer: ''
                                                });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border rounded"
                                    >
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="true_false">True/False</option>
                                        <option value="fill_blank">Fill in the Blank</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Points</label>
                                    <input
                                        type="number"
                                        value={currentQuestion.points}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Multiple Choice Options */}
                            {currentQuestion.questionType === 'multiple_choice' && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium mb-1">Options</label>
                                    {currentQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(idx, 'text', e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded"
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={opt.isCorrect}
                                                    onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                                                />
                                                Correct
                                            </label>
                                            {currentQuestion.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(idx)}
                                                    className="text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}

                            {/* True/False Options */}
                            {currentQuestion.questionType === 'true_false' && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="tfCorrect"
                                                checked={currentQuestion.options[0]?.isCorrect}
                                                onChange={() => {
                                                    setCurrentQuestion({
                                                        ...currentQuestion,
                                                        options: [
                                                            { text: 'True', isCorrect: true },
                                                            { text: 'False', isCorrect: false }
                                                        ]
                                                    });
                                                }}
                                            />
                                            True
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="tfCorrect"
                                                checked={currentQuestion.options[1]?.isCorrect}
                                                onChange={() => {
                                                    setCurrentQuestion({
                                                        ...currentQuestion,
                                                        options: [
                                                            { text: 'True', isCorrect: false },
                                                            { text: 'False', isCorrect: true }
                                                        ]
                                                    });
                                                }}
                                            />
                                            False
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Fill in the Blank */}
                            {currentQuestion.questionType === 'fill_blank' && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <input
                                        type="text"
                                        value={currentQuestion.correctAnswer}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                        className="w-full px-3 py-2 border rounded"
                                        placeholder="Enter the correct answer"
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowQuestionForm(false);
                                        setEditingQuestionIndex(null);
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    Create Quiz
                </button>
            </form>
        </div>
    );
};

export default QuizCreator;