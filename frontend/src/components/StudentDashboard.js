import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContentViewer from './ContentViewer';
import RichTextEditor from './RichTextEditor';

const StudentDashboard = ({ token, user }) => {
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [myWorks, setMyWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');

    const subjects = ['all', 'microsoft_word', 'excel', 'powerpoint', 'internet', 'other'];
    const subjectNames = {
        'microsoft_word': 'Microsoft Word',
        'excel': 'Excel',
        'powerpoint': 'PowerPoint',
        'internet': 'Internet',
        'other': 'Other Subjects'
    };

    useEffect(() => {
        fetchContents();
        fetchMyWorks();
    }, [selectedSubject]);

    const fetchContents = async () => {
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
        }
    };

    const fetchMyWorks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/student/my-work', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyWorks(response.data);
        } catch (error) {
            console.error('Error fetching works:', error);
        }
    };

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
        }
    };

    const startWorking = (content) => {
        setSelectedContent(content);
        setShowEditor(true);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Interactive Classroom</h1>
                        <p className="text-blue-100 text-sm">Student Portal</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white">Welcome, {user.name}!</span>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
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
                        📚 Browse Content
                    </button>
                    <button
                        onClick={() => setActiveTab('mywork')}
                        className={`py-3 px-6 font-medium transition ${
                            activeTab === 'mywork' 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                    >
                        ✏️ My Work
                    </button>
                </div>

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

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contents.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white rounded-lg">
                                    <p className="text-gray-500">No content available for this subject yet.</p>
                                </div>
                            ) : (
                                contents.map(content => (
                                    <div key={content._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-bold text-xl text-gray-800">{content.title}</h3>
                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                                    {subjectNames[content.subject] || content.subject}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {content.description || 'No description provided'}
                                            </p>
                                            <div className="text-xs text-gray-500 mb-4">
                                                📅 {new Date(content.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedContent(content)}
                                                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    onClick={() => startWorking(content)}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                                >
                                                    ✏️ Work on it
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'mywork' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">My Submitted Work</h2>
                        {myWorks.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">You haven't submitted any work yet.</p>
                                <p className="text-gray-400 text-sm mt-2">Browse content and start working on it!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myWorks.map(work => (
                                    <div key={work._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {work.contentId?.title || 'Unknown Content'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Submitted: {new Date(work.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedContent(work.contentId);
                                                    setShowEditor(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View/Edit Work
                                            </button>
                                        </div>
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                            <div 
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: work.annotatedContent.substring(0, 200) + '...' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Viewer Modal */}
            {selectedContent && !showEditor && (
                <ContentViewer content={selectedContent} onClose={() => setSelectedContent(null)} />
            )}

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
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-bold mb-2">📖 Original Content (Reference):</h3>
                                {selectedContent.elements?.filter(el => el.type === 'text').map((el, idx) => (
                                    <p key={idx} className="text-gray-700">{el.content}</p>
                                ))}
                                {selectedContent.elements?.filter(el => el.type === 'image').map((el, idx) => (
                                    <img key={idx} src={el.url} alt="Reference" className="max-w-sm rounded mt-2" />
                                ))}
                                {selectedContent.elements?.filter(el => el.type === 'youtube').map((el, idx) => (
                                    <div key={idx} className="mt-2">
                                        <p className="text-sm text-gray-600">📺 YouTube Video Reference</p>
                                    </div>
                                ))}
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