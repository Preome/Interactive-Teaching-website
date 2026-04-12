import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');

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

    // Combine and filter content based on type + search
    const getAllContent = useMemo(() => {
        let allItems = [];
        
        if (selectedType === 'all' || selectedType === 'regular') {
            allItems.push(...contents.map(c => ({ ...c, itemType: 'regular' })));
        }
        if (selectedType === 'all' || selectedType === 'article') {
            allItems.push(...articles.map(a => ({ ...a, itemType: 'article' })));
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            allItems = allItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query) ||
                subjectNames[item.subject]?.toLowerCase().includes(query) ||
                item.content?.toLowerCase().includes(query)
            );
        }
        
        return allItems;
    }, [contents, articles, selectedType, searchQuery]);

    const filteredContent = getAllContent;

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
                        {/* Search Bar */}
                        <div className="bg-white rounded-xl shadow-lg mb-6 p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder=" Search lessons, articles, subjects..."
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        🔍
                                    </div>
                                </div>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                                <span className="text-sm text-gray-500">
                                    {filteredContent.length} results
                                </span>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow mb-6 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Subject Filter */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Filter by Subject:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map(subject => (
                                            <button
                                                key={subject}
                                                onClick={() => setSelectedSubject(subject)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                                                    selectedSubject === subject
                                                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                                }`}
                                            >
                                                {subject === 'all' ? 'All Subjects' : subjectNames[subject]?.split(' ')[0] || subject}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Content Type Filter */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Content Type:</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                                                selectedType === 'all'
                                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                        >
                                            All Types
                                        </button>
                                        <button
                                            onClick={() => setSelectedType('regular')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                                                selectedType === 'regular'
                                                    ? 'bg-green-600 text-white shadow-md ring-2 ring-green-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                        >
                                            📹 Regular Lessons
                                        </button>
                                        <button
                                            onClick={() => setSelectedType('article')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                                                selectedType === 'article'
                                                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                        >
                                            📖 Interactive Articles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-lg">Loading lessons...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Content Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredContent.length === 0 ? (
                                    <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
                                        <div className="text-6xl mb-4 opacity-50">📚</div>
                                        <h3 className="text-2xl font-bold text-gray-600 mb-2">No lessons found</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                            Try adjusting your search, subjects, or content type filters above.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedSubject('all');
                                                setSelectedType('all');
                                            }}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredContent.map(item => (
                                        <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border hover:border-blue-200 group">
                                            {/* Type Badge */}
                                            <div className={`px-4 py-2 text-white text-xs font-bold ${
                                                item.itemType === 'article' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                                            }`}>
                                                {item.itemType === 'article' ? '📖 Interactive Article' : '📹 Multimedia Lesson'}
                                            </div>
                                            
                                            {/* Preview */}
                                            <div className="h-40 bg-gradient-to-br relative overflow-hidden">
                                                {item.itemType === 'regular' && getPreviewImage(item) ? (
                                                    <img 
                                                        src={getPreviewImage(item)} 
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br p-4">
                                                        <div className="text-4xl mb-3 opacity-90">
                                                            {item.itemType === 'article' ? '📖' : '📱'}
                                                        </div>
                                                        <p className="text-sm font-semibold text-center line-clamp-2 px-2">
                                                            {subjectNames[item.subject]?.split(' ')[0] || item.subject}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-6">
                                                <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                    {item.itemType === 'article' 
                                                        ? item.content?.replace(/<[^>]*>/g, '').substring(0, 100) || item.description
                                                        : (item.description || 'Interactive multimedia lesson')}
                                                </p>
                                                
                                                {/* Stats */}
                                                <div className="flex flex-wrap gap-2 mb-5">
                                                    {item.itemType === 'regular' && (
                                                        <>
                                                            {getContentStats(item).text > 0 && (
                                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                    📝 {getContentStats(item).text} Text
                                                                </span>
                                                            )}
                                                            {getContentStats(item).images > 0 && (
                                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                    🖼️ {getContentStats(item).images} Images
                                                                </span>
                                                            )}
                                                            {getContentStats(item).videos > 0 && (
                                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                    🎬 {getContentStats(item).videos} Videos
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    {item.itemType === 'article' && item.interactiveElements?.length > 0 && (
                                                        <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                                                            ✨ {item.interactiveElements.length} Interactive Elements
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="text-xs text-gray-500 mb-5 flex items-center justify-between">
                                                    <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                        {subjectNames[item.subject]?.split(' (')[0] || item.subject}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-3 pt-1">
                                                    <button
                                                        onClick={() => item.itemType === 'article' ? viewArticle(item._id) : viewContent(item._id)}
                                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] text-sm"
                                                    >
                                                        👁️ View Lesson
                                                    </button>
                                                    {item.itemType === 'regular' && (
                                                        <button
                                                            onClick={() => startWorking(item)}
                                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] text-sm"
                                                        >
                                                            ✏️ Practice
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
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            <span>✏️</span>
                            My Practice Work ({myWorks.length})
                        </h2>
                        {myWorks.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-7xl mb-6 opacity-20">📝</div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-3">No practice work yet</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">Browse lessons above and click "Practice" to start annotating and building your knowledge base!</p>
                                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-semibold text-lg">
                                    📚 Browse Lessons
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {myWorks.map(work => (
                                    <div key={work._id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all shadow-md">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="font-bold text-xl text-gray-800 line-clamp-1">
                                                        {work.contentId?.title || 'Untitled Practice'}
                                                    </h3>
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                                                        Completed
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Subject: <span className="font-semibold">{subjectNames[work.contentId?.subject] || work.contentId?.subject}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Submitted: {new Date(work.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedContent(work.contentId);
                                                    setShowEditor(true);
                                                }}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg font-semibold whitespace-nowrap"
                                            >
                                                Edit & Continue
                                            </button>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div 
                                                className="prose prose-lg max-w-none bg-white p-6 rounded-xl shadow-inner border prose-headings:font-bold prose-a:text-blue-600"
                                                dangerouslySetInnerHTML={{ __html: work.annotatedContent }}
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center z-10 shadow-lg">
                            <div>
                                <h2 className="text-2xl font-bold">✏️ Practice: {selectedContent.title}</h2>
                                <p className="text-blue-100 opacity-90">Annotate and build your understanding</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowEditor(false);
                                    setSelectedContent(null);
                                }} 
                                className="text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all text-xl backdrop-blur-sm"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    📖 Original Lesson (Reference)
                                </h3>
                                {selectedContent.elements?.filter(el => el.type === 'text').length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedContent.elements.filter(el => el.type === 'text').map((el, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border">
                                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{el.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                        <p className="text-gray-500 text-lg">No text content for reference</p>
                                    </div>
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

