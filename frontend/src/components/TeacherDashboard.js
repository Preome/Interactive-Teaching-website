import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import ContentUpload from './ContentUpload';
import QuizCreator from './QuizCreator';
import QuizList from './QuizList';

const TeacherDashboard = ({ token, user }) => {
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [editingContent, setEditingContent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [refreshQuizzes, setRefreshQuizzes] = useState(false);

    const subjectNames = {
        'microsoft_word': 'Microsoft Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'internet': 'Internet',
        'bangla': 'Bangla (Bengali)',
        'english': 'English',
        'math': 'Mathematics',
        'science': 'Science',
        'physics': 'Physics',
        'chemistry': 'Chemistry',
        'biology': 'Biology',
        'programming': 'Programming',
        'database': 'Database',
        'history': 'History',
        'geography': 'Geography',
        'economics': 'Economics',
        'civics': 'Civics',
        'bangla_article': 'Bangla Article',
        'english_article': 'English Article',
        'news_article': 'News Article',
        'interactive_story': 'Interactive Story',
        'other': 'Other Subjects'
    };

    const fetchContents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
const response = await api.get('/api/content/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetched contents:', response.data);
            setContents(response.data);
        } catch (error) {
            console.error('Error fetching contents:', error);
            setError('Failed to load contents. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const handleDelete = async (contentId) => {
        if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            try {
await api.delete(`/api/content/${contentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('✅ Content deleted successfully');
                fetchContents();
            } catch (error) {
                console.error('Delete error:', error);
                alert('❌ Error deleting content: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const handleEdit = (content) => {
        setEditingContent(content);
        setShowEditModal(true);
        setActiveTab('upload');
    };

    const handleUploadSuccess = () => {
        fetchContents();
        setActiveTab('manage');
        setShowEditModal(false);
        setEditingContent(null);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingContent(null);
        setActiveTab('manage');
    };

    const handleViewContent = (contentId) => {
        navigate(`/content/${contentId}`);
    };

    const handleQuizCreated = () => {
        setRefreshQuizzes(!refreshQuizzes);
        alert('Quiz created successfully!');
    };

    const getContentTypeIcon = (content) => {
        if (content.contentType === 'interactive_article') return '📰';
        if (content.elements?.some(el => el.type === 'interactive_text')) return '📰';
        if (content.elements?.some(el => el.type === 'youtube')) return '📺';
        if (content.elements?.some(el => el.type === 'video')) return '🎬';
        if (content.elements?.some(el => el.type === 'audio')) return '🎵';
        if (content.elements?.some(el => el.type === 'image')) return '🖼️';
        return '📄';
    };

    const getContentStats = (content) => {
        const stats = {
            text: content.elements?.filter(el => el.type === 'text').length || 0,
            images: content.elements?.filter(el => el.type === 'image' && el.url).length || 0,
            videos: content.elements?.filter(el => el.type === 'video' && el.url).length || 0,
            audio: content.elements?.filter(el => el.type === 'audio' && el.url).length || 0,
            youtube: content.elements?.filter(el => el.type === 'youtube').length || 0,
            interactive: content.elements?.filter(el => el.type === 'interactive_text').length || 0
        };
        return stats;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">👨‍🏫 Teacher Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your interactive classroom content and quizzes</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user?.name}!</span>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }} 
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Buttons */}
                <div className="flex gap-4 mb-8 border-b bg-white rounded-t-lg px-4 overflow-x-auto">
                    <button
                        onClick={() => {
                            setActiveTab('upload');
                            setShowEditModal(false);
                            setEditingContent(null);
                        }}
                        className={`py-3 px-6 font-medium transition whitespace-nowrap ${
                            activeTab === 'upload' && !showEditModal
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        📤 Upload Content
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('manage');
                            setShowEditModal(false);
                        }}
                        className={`py-3 px-6 font-medium transition whitespace-nowrap ${
                            activeTab === 'manage' && !showEditModal
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        📚 Manage Content ({contents.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('createQuiz');
                            setShowEditModal(false);
                        }}
                        className={`py-3 px-6 font-medium transition whitespace-nowrap ${
                            activeTab === 'createQuiz'
                                ? 'border-b-2 border-green-500 text-green-600' 
                                : 'text-gray-600 hover:text-green-600'
                        }`}
                    >
                        📝 Create Quiz
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('manageQuizzes');
                            setShowEditModal(false);
                        }}
                        className={`py-3 px-6 font-medium transition whitespace-nowrap ${
                            activeTab === 'manageQuizzes'
                                ? 'border-b-2 border-purple-500 text-purple-600' 
                                : 'text-gray-600 hover:text-purple-600'
                        }`}
                    >
                        🎯 Manage Quizzes
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Upload Content Tab */}
                {activeTab === 'upload' && !showEditModal && (
                    <ContentUpload token={token} onUploadSuccess={handleUploadSuccess} />
                )}

                {/* Edit Content Modal */}
                {showEditModal && editingContent && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">✏️ Editing: {editingContent.title}</h2>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-gray-700 px-4 py-2 bg-gray-100 rounded-lg"
                            >
                                Cancel Edit
                            </button>
                        </div>
                        <ContentUpload 
                            token={token} 
                            onUploadSuccess={handleUploadSuccess}
                            editingContent={editingContent}
                            isEditing={true}
                        />
                    </div>
                )}

                {/* Manage Content Tab */}
                {activeTab === 'manage' && !showEditModal && (
                    <div>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading content...</p>
                            </div>
                        ) : contents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-500 text-lg">No content uploaded yet.</p>
                                <p className="text-gray-400 mt-2">Click "Upload Content" to add your first lesson!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contents.map(content => {
                                    const stats = getContentStats(content);
                                    return (
                                        <div key={content._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-300">
                                            {/* Preview Header */}
                                            <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center relative">
                                                <div className="text-center text-white">
                                                    <div className="text-5xl mb-2">{getContentTypeIcon(content)}</div>
                                                    <p className="text-sm font-medium">{subjectNames[content.subject] || content.subject}</p>
                                                </div>
                                                {(content.contentType === 'interactive_article' || stats.interactive > 0) && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full">
                                                            📰 Interactive
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-5">
                                                <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">{content.title}</h3>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                                    {content.description || 'No description provided'}
                                                </p>
                                                
                                                {/* Content Stats */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {stats.text > 0 && (
                                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">📝 {stats.text}</span>
                                                    )}
                                                    {stats.interactive > 0 && (
                                                        <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">📰 {stats.interactive} Article(s)</span>
                                                    )}
                                                    {stats.images > 0 && (
                                                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">🖼️ {stats.images}</span>
                                                    )}
                                                    {stats.videos > 0 && (
                                                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">🎬 {stats.videos}</span>
                                                    )}
                                                    {stats.audio > 0 && (
                                                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs">🎵 {stats.audio}</span>
                                                    )}
                                                    {stats.youtube > 0 && (
                                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">📺 {stats.youtube}</span>
                                                    )}
                                                </div>
                                                
                                                <div className="text-xs text-gray-400 mb-4 flex items-center justify-between">
                                                    <span>📅 {new Date(content.createdAt).toLocaleDateString()}</span>
                                                    {content.contentType === 'interactive_article' && (
                                                        <span className="text-indigo-500">✨ Interactive</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewContent(content._id)}
                                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                                    >
                                                        👁️ View Content
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(content)}
                                                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-medium text-sm"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(content._id)}
                                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Quiz Tab */}
                {activeTab === 'createQuiz' && (
                    <QuizCreator token={token} onQuizCreated={handleQuizCreated} />
                )}

                {/* Manage Quizzes Tab */}
                {activeTab === 'manageQuizzes' && (
                    <QuizList token={token} user={user} onTakeQuiz={() => {}} isTeacher={true} />
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;