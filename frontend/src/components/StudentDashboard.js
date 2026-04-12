import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RichTextEditor from './RichTextEditor';

const StudentDashboard = ({ token, user }) => {
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [myWorks, setMyWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const subjects = ['all', 'microsoft_word', 'excel', 'powerpoint', 'internet', 'other'];
    const subjectNames = {
        'microsoft_word': 'Microsoft Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'internet': 'Internet',
        'other': 'Other Subjects'
    };

    // Fetch contents with useCallback to avoid recreation
    const fetchContents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const url = selectedSubject === 'all' 
                ? 'http://localhost:5000/api/content/all'
                : `http://localhost:5000/api/content/all?subject=${selectedSubject}`;
            
            console.log('Fetching from URL:', url);
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Fetched contents:', response.data);
            setContents(response.data);
            
            if (response.data.length === 0) {
                setError('No content available for this subject.');
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
            setError('Failed to load content. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedSubject, token]);

    // Fetch my works with useCallback
    const fetchMyWorks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/student/my-work', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('My works:', response.data);
            setMyWorks(response.data);
        } catch (error) {
            console.error('Error fetching works:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchContents();
        fetchMyWorks();
    }, [fetchContents, fetchMyWorks]);

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

    // UPDATED: Navigate to separate page instead of showing modal
    const viewContent = (contentId) => {
        navigate(`/content/${contentId}`);
    };

    // Get preview image from content
    const getPreviewImage = (content) => {
        const imageElement = content.elements?.find(el => el.type === 'image');
        return imageElement ? imageElement.url : null;
    };

    // Get content stats for display
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
                        📚 Browse Content ({contents.length})
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
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {subject === 'all' ? 'All Subjects' : subjectNames[subject]}
                                    </button>
                                ))}
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
                                {contents.length === 0 ? (
                                    <div className="col-span-full text-center py-12 bg-white rounded-lg">
                                        <p className="text-gray-500 text-lg">No content available for this subject yet.</p>
                                        <p className="text-gray-400 text-sm mt-2">Check back later for new lessons!</p>
                                    </div>
                                ) : (
                                    contents.map(content => {
                                        const stats = getContentStats(content);
                                        return (
                                            <div key={content._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 duration-300">
                                                {/* Preview Image or Icon */}
                                                <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center relative">
                                                    {getPreviewImage(content) ? (
                                                        <img 
                                                            src={getPreviewImage(content)} 
                                                            alt={content.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-center text-white">
                                                            <div className="text-6xl mb-2">📚</div>
                                                            <p className="text-sm font-medium">{subjectNames[content.subject]}</p>
                                                        </div>
                                                    )}
                                                    {/* Subject badge overlay */}
                                                    <div className="absolute top-2 right-2">
                                                        <span className="text-xs bg-white text-blue-600 px-2 py-1 rounded-full shadow-md font-medium">
                                                            {subjectNames[content.subject]?.split(' ')[0] || content.subject}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5">
                                                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">{content.title}</h3>
                                                    
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                                        {content.description || 'No description provided'}
                                                    </p>
                                                    
                                                    {/* Content Stats with Icons */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {stats.text > 0 && (
                                                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                📝 {stats.text}
                                                            </span>
                                                        )}
                                                        {stats.images > 0 && (
                                                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                🖼️ {stats.images}
                                                            </span>
                                                        )}
                                                        {stats.videos > 0 && (
                                                            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                🎬 {stats.videos}
                                                            </span>
                                                        )}
                                                        {stats.audio > 0 && (
                                                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                🎵 {stats.audio}
                                                            </span>
                                                        )}
                                                        {stats.youtube > 0 && (
                                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                📺 {stats.youtube}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-xs text-gray-400 mb-4">
                                                        📅 {new Date(content.createdAt).toLocaleDateString()}
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => viewContent(content._id)}
                                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                                        >
                                                            👁️ View Content
                                                        </button>
                                                        <button
                                                            onClick={() => startWorking(content)}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                                        >
                                                            ✏️ Work on it
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
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
                            {/* Show the original content for reference */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg max-h-60 overflow-y-auto">
                                <h3 className="font-bold mb-2">📖 Original Content (Reference):</h3>
                                {selectedContent.elements?.filter(el => el.type === 'text').length > 0 ? (
                                    selectedContent.elements.filter(el => el.type === 'text').map((el, idx) => (
                                        <p key={idx} className="text-gray-700 mb-2">{el.content}</p>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No text content available for reference.</p>
                                )}
                                {selectedContent.elements?.filter(el => el.type === 'image').length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Reference Images:</p>
                                        {selectedContent.elements.filter(el => el.type === 'image').slice(0, 2).map((el, idx) => (
                                            <img key={idx} src={el.url} alt="Reference" className="max-w-full max-h-32 rounded mt-2" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Rich Text Editor */}
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