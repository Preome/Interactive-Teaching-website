import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const QuizList = ({ token, user, onTakeQuiz, isTeacher = false }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [results, setResults] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const subjects = ['all', 'microsoft_word', 'excel', 'powerpoint', 'internet', 'bangla', 'english', 'math', 'science', 'history', 'geography', 'other'];
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

    useEffect(() => {
        fetchQuizzes();
        if (!isTeacher) {
            fetchResults();
        }
    }, [selectedSubject]);

    const fetchQuizzes = async () => {
        try {
            const url = selectedSubject === 'all' 
                ? 'http://localhost:5000/api/quiz/all'
                : `http://localhost:5000/api/quiz/all?subject=${selectedSubject}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/quiz/results/my-results', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/quiz/${quizId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Quiz deleted successfully');
                fetchQuizzes();
            } catch (error) {
                console.error('Error deleting quiz:', error);
                alert('Error deleting quiz: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const getQuizStatus = (quizId) => {
        const userResults = results.filter(r => r.quizId?._id === quizId);
        if (userResults.length === 0) return { taken: false, bestScore: null, attempts: 0 };
        const bestScore = Math.max(...userResults.map(r => r.percentage));
        const attempts = userResults.length;
        return { taken: true, bestScore: bestScore, attempts: attempts };
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading quizzes...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Subject Filter */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <label className="block text-gray-700 font-medium mb-2">Filter by Subject:</label>
                <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedSubject === subject
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {subject === 'all' ? 'All Subjects' : subjectNames[subject]}
                        </button>
                    ))}
                </div>
            </div>

            {quizzes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg">No quizzes available</p>
                    {isTeacher && (
                        <p className="text-gray-400 mt-2">Create your first quiz using the "Create Quiz" tab!</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => {
                        const status = !isTeacher ? getQuizStatus(quiz._id) : null;
                        return (
                            <div key={quiz._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                                    <p className="text-sm opacity-90">{subjectNames[quiz.subject]}</p>
                                </div>
                                
                                <div className="p-4">
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {quiz.description || 'No description'}
                                    </p>
                                    
                                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                                        <span>📝 {quiz.questions?.length || 0} questions</span>
                                        <span>⏱️ {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'}</span>
                                        <span>✅ Need {quiz.passingScore}% to pass</span>
                                    </div>

                                    {!isTeacher && status && status.taken && (
                                        <div className="mb-3 p-2 rounded text-center text-sm bg-gray-50">
                                            {status.bestScore >= quiz.passingScore ? (
                                                <span className="text-green-600">✅ Best Score: {Math.round(status.bestScore)}%</span>
                                            ) : (
                                                <span className="text-yellow-600">📊 Best Score: {Math.round(status.bestScore)}%</span>
                                            )}
                                            <span className="text-gray-500 ml-2">({status.attempts} attempt(s))</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onTakeQuiz(quiz)}
                                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                                        >
                                            {status?.taken ? 'Take Again' : 'Start Quiz'}
                                        </button>
                                        {isTeacher && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingQuiz(quiz);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Quiz Modal - Simple version */}
            {showEditModal && editingQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">Edit Quiz: {editingQuiz.title}</h2>
                        <p className="text-gray-600 mb-4">Edit functionality coming soon. For now, please delete and recreate.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingQuiz(null);
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;