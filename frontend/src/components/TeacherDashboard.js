import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ContentUpload from './ContentUpload';
import ContentViewer from './ContentViewer';

const TeacherDashboard = ({ token, user }) => {
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [editingContent, setEditingContent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);

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
        try {
            const response = await axios.get('http://localhost:5000/api/content/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContents(response.data);
        } catch (error) {
            console.error('Error fetching contents:', error);
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
                await axios.delete(`http://localhost:5000/api/content/${contentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Content deleted successfully');
                fetchContents();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error deleting content: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const handleEdit = (content) => {
        setEditingContent(content);
        setShowEditModal(true);
    };

    const handleUploadSuccess = () => {
        fetchContents();
        setActiveTab('manage');
        setShowEditModal(false);
        setEditingContent(null);
    };

    const getContentTypeIcon = (content) => {
        if (content.contentType === 'interactive_article') return '📰';
        if (content.elements?.some(el => el.type === 'youtube')) return '📺';
        if (content.elements?.some(el => el.type === 'video')) return '🎬';
        if (content.elements?.some(el => el.type === 'audio')) return '🎵';
        if (content.elements?.some(el => el.type === 'image')) return '🖼️';
        return '📄';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage your interactive classroom content</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user?.name}!</span>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }} 
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Buttons */}
                <div className="flex gap-4 mb-8 border-b bg-white rounded-t-lg px-4">
                    <button
                        onClick={() => {
                            setActiveTab('upload');
                            setEditingContent(null);
                            setShowEditModal(false);
                        }}
                        className={`py-3 px-6 font-medium transition ${
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
                        className={`py-3 px-6 font-medium transition ${
                            activeTab === 'manage' && !showEditModal
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        📚 Manage Content ({contents.length})
                    </button>
                </div>

                {/* Upload Content Tab */}
                {activeTab === 'upload' && !showEditModal && (
                    <ContentUpload token={token} onUploadSuccess={handleUploadSuccess} />
                )}

                {/* Edit Content Modal */}
                {showEditModal && editingContent && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">✏️ Editing: {editingContent.title}</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingContent(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
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
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading content...</p>
                            </div>
                        ) : contents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-500 text-lg">No content uploaded yet.</p>
                                <p className="text-gray-400 mt-2">Click "Upload Content" to add your first lesson!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contents.map(content => (
                                    <div key={content._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-300">
                                        {/* Preview Header */}
                                        <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center relative">
                                            <div className="text-center text-white">
                                                <div className="text-5xl mb-2">{getContentTypeIcon(content)}</div>
                                                <p className="text-sm font-medium">{subjectNames[content.subject] || content.subject}</p>
                                            </div>
                                            {content.contentType === 'interactive_article' && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full">
                                                        Interactive
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
                                                {content.elements?.filter(el => el.type === 'text').length > 0 && (
                                                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">📝 {content.elements.filter(el => el.type === 'text').length}</span>
                                                )}
                                                {content.elements?.filter(el => el.type === 'interactive_text').length > 0 && (
                                                    <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">📰 Interactive</span>
                                                )}
                                                {content.elements?.filter(el => el.type === 'image').length > 0 && (
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">🖼️ {content.elements.filter(el => el.type === 'image').length}</span>
                                                )}
                                                {content.elements?.filter(el => el.type === 'video').length > 0 && (
                                                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">🎬 {content.elements.filter(el => el.type === 'video').length}</span>
                                                )}
                                            </div>
                                            
                                            <div className="text-xs text-gray-400 mb-4">
                                                📅 {new Date(content.createdAt).toLocaleDateString()}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedContent(content)}
                                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                                                >
                                                    👁️ View
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
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Viewer Modal */}
            {selectedContent && (
                <ContentViewer content={selectedContent} onClose={() => setSelectedContent(null)} isTeacher={true} />
            )}
        </div>
    );
};

export default TeacherDashboard;