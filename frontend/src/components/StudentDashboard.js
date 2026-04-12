import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';

const StudentDashboard = ({ token, user }) => {
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [articles, setArticles] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedType, setSelectedType] = useState('all'); // 'all', 'regular', 'article'
    const [myWorks, setMyWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const subjects = ['all', 'microsoft_word', 'excel', 'powerpoint', 'internet', 'bangla', 'english', 'math', 'science', 'other'];
    const subjectNames = {
        'microsoft_word': 'Microsoft Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'internet': 'Internet',
        'bangla': 'বাংলা (Bengali)',
        'english': 'English',
        'math': 'Mathematics',
        'science': 'Science',
        'other': 'Other Subjects'
    };

    // Fetch contents
    const fetchContents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const url = selectedSubject === 'all' 
                ? 'http://localhost:5000/api/content/all'
                : `http://localhost:5000/api/content/all?subject=${selectedSubject}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContents(response.data);
        } catch (error) {
            console.error('Error fetching contents:', error);
            setError('Failed to load content.');
        } finally {
            setLoading(false);
        }
    }, [selectedSubject, token]);

    // Fetch interactive articles
    const fetchArticles = useCallback(async () => {
        try {
            const url = selectedSubject === 'all' 
                ? 'http://localhost:5000/api/interactive-article/all'
                : `http://localhost:5000/api/interactive-article/all?subject=${selectedSubject}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticles(response.data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    }, [selectedSubject, token]);

    const fetchMyWorks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/student/my-work', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyWorks(response.data);
        } catch (error) {
            console.error('Error fetching works:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchContents();
        fetchArticles();
        fetchMyWorks();
    }, [fetchContents, fetchArticles, fetchMyWorks]);

    const saveWork = async (contentId, annotatedContent) => {
        try {
            await axios.post('http://localhost:5000/api/student/save-work', {
                contentId,
                annotatedContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Work saved successfully!');
            fetchMyWorks();
            setShowEditor(false);
            setSelectedContent(null);
        } catch (error) {
            console.error('Error saving work:', error);
            alert('Error saving work: ' + (error.response?.data?.error || error.message));
        }
    };

    const startWorking = (content) => {
        setSelectedContent(content);
        setShowEditor(true);
    };

    const viewContent = (contentId) => {
        navigate(`/content/${contentId}`);
    };

    const viewArticle = (articleId) => {
        navigate(`/article/${articleId}`);
    };

    const getPreviewImage = (content) => {
        const imageElement = content.elements?.find(el => el.type === 'image');
        return imageElement ? imageElement.url : null;
    };

    const getContentStats = (content) => {
        const stats = {
            text: content.elements?.filter(el => el.type === 'text').length || 0,
            images: content.elements?.filter(el => el.type === 'image').length || 0,
            videos: content.elements?.filter(el => el.type === 'video').length || 0,
            audio: content.elements?.filter(el => el.type === 'audio').length || 0,
            youtube: content.elements?.filter(el => el.type === 'youtube').length || 0
        };
        return stats;
    };

    // Combine and filter content based on type
    const getAllContent = () => {
        let allItems = [];
        
        if (selectedType === 'all' || selectedType === 'regular') {
            allItems.push(...contents.map(c => ({ ...c, itemType: 'regular' })));
        }
        if (selectedType === 'all' || selectedType === 'article') {
            allItems.push(...articles.map(a => ({ ...a, itemType: 'article' })));
        }
        
        return allItems;
    };

    const filteredContent = getAllContent();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Interactive Classroom</h1>
                        <p className="text-blue-100 text-sm">Student Portal</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white">Welcome, {user?.name}!</span>
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
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b bg-white rounded-t-lg px-4">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`py-3 px-6 font-medium transition ${
                            activeTab === 'browse' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        📚 Browse ({filteredContent.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('mywork')}
                        className={`py-3 px-6 font-medium transition ${
                            activeTab === 'mywork' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        ✏️ My Work ({myWorks.length})
                    </button>
                </div>

                {/* Browse Content Tab */}
                {activeTab === 'browse' && (
                    <>
                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow mb-6 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Subject Filter */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Filter by Subject:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map(subject => (
                                            <button
                                                key={subject}
                                                onClick={() => setSelectedSubject(subject)}
                                                className={`px-3 py-1 rounded-lg text-sm transition ${
                                                    selectedSubject === subject
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {subject === 'all' ? 'All' : subjectNames[subject].split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Content Type Filter */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Content Type:</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={`px-4 py-1 rounded-lg transition ${
                                                selectedType === 'all'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setSelectedType('regular')}
                                            className={`px-4 py-1 rounded-lg transition ${
                                                selectedType === 'regular'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            📹 Regular
                                        </button>
                                        <button
                                            onClick={() => setSelectedType('article')}
                                            className={`px-4 py-1 rounded-lg transition ${
                                                selectedType === 'article'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            📖 Interactive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Loading content...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Content Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredContent.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-white rounded-lg">
                                        <p className="text-gray-500 text-lg">No content available</p>
                                        <p className="text-gray-400 text-sm mt-2">Check back later for new lessons!</p>
                                    </div>
                                ) : (
                                    filteredContent.map(item => (
                                        <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-300">
                                            {/* Type Badge */}
                                            <div className={`px-3 py-1 text-white text-xs font-medium ${
                                                item.itemType === 'article' ? 'bg-purple-600' : 'bg-blue-600'
                                            }`}>
                                                {item.itemType === 'article' ? '📖 Interactive Article' : '📹 Regular Content'}
                                            </div>
                                            
                                            {/* Preview Image or Icon */}
                                            <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center relative">
                                                {item.itemType === 'regular' && getPreviewImage(item) ? (
                                                    <img 
                                                        src={getPreviewImage(item)} 
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center text-white">
                                                        <div className="text-5xl mb-2">
                                                            {item.itemType === 'article' ? '📖' : '📚'}
                                                        </div>
                                                        <p className="text-sm font-medium">
                                                            {subjectNames[item.subject]?.split(' ')[0] || item.subject}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-5">
                                                <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">{item.title}</h3>
                                                
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                                    {item.itemType === 'article' 
                                                        ? item.content.replace(/<[^>]*>/g, '').substring(0, 100)
                                                        : (item.description || 'No description provided')}
                                                </p>
                                                
                                                {/* Stats for regular content */}
                                                {item.itemType === 'regular' && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {getContentStats(item).text > 0 && (
                                                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">📝 {getContentStats(item).text}</span>
                                                        )}
                                                        {getContentStats(item).images > 0 && (
                                                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">🖼️ {getContentStats(item).images}</span>
                                                        )}
                                                        {getContentStats(item).videos > 0 && (
                                                            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">🎬 {getContentStats(item).videos}</span>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Stats for interactive articles */}
                                                {item.itemType === 'article' && item.interactiveElements?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                                                            🔗 {item.interactiveElements.length} interactive elements
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className="text-xs text-gray-400 mb-4">
                                                    📅 {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => item.itemType === 'article' ? viewArticle(item._id) : viewContent(item._id)}
                                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                                    >
                                                        👁️ View Content
                                                    </button>
                                                    {item.itemType === 'regular' && (
                                                        <button
                                                            onClick={() => startWorking(item)}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                                        >
                                                            ✏️ Work on it
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* My Work Tab */}
                {activeTab === 'mywork' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">My Submitted Work</h2>
                        {myWorks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-gray-500 text-lg">You haven't submitted any work yet.</p>
                                <p className="text-gray-400 text-sm mt-2">Browse content and start working on it!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myWorks.map(work => (
                                    <div key={work._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {work.contentId?.title || 'Unknown Content'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Subject: {subjectNames[work.contentId?.subject] || work.contentId?.subject}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Submitted: {new Date(work.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedContent(work.contentId);
                                                    setShowEditor(true);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Edit Work
                                            </button>
                                        </div>
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                            <div 
                                                className="prose prose-sm max-w-none text-gray-700"
                                                dangerouslySetInnerHTML={{ __html: work.annotatedContent.length > 200 ? work.annotatedContent.substring(0, 200) + '...' : work.annotatedContent }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rich Text Editor Modal */}
            {showEditor && selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Working on: {selectedContent.title}</h2>
                                <p className="text-gray-600 text-sm">Use the toolbar to format your text (Bold, Italic, etc.)</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedContent(null);
                                }} 
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg max-h-60 overflow-y-auto">
                                <h3 className="font-bold mb-2">📖 Original Content (Reference):</h3>
                                {selectedContent.elements?.filter(el => el.type === 'text').length > 0 ? (
                                    selectedContent.elements.filter(el => el.type === 'text').map((el, idx) => (
                                        <p key={idx} className="text-gray-700 mb-2">{el.content}</p>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No text content available for reference.</p>
                                )}
                            </div>
                            
                            <RichTextEditor 
                                initialContent={myWorks.find(w => w.contentId?._id === selectedContent._id)?.annotatedContent || ''}
                                onSave={(content) => saveWork(selectedContent._id, content)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;