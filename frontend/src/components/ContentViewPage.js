import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';

const ContentViewPage = ({ token, user }) => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/content/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching content:', error);
            setError('Failed to load content');
            setLoading(false);
        }
    };

    const getSubjectName = (subject) => {
        const subjectNames = {
            'microsoft_word': 'Microsoft Word',
            'excel': 'Excel',
            'powerpoint': 'PowerPoint',
            'internet': 'Internet',
            'other': 'Other Subjects'
        };
        return subjectNames[subject] || subject;
    };

    const renderElement = (element, index) => {
        switch (element.type) {
            case 'text':
                return (
                    <div key={index} className="mb-6 p-6 bg-white rounded-lg shadow-md">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{element.content}</p>
                    </div>
                );
                
            case 'image':
                return (
                    <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">📷 Image</h3>
                        </div>
                        <div className="p-4">
                            <img 
                                src={element.url} 
                                alt={element.content || 'Image'} 
                                className="max-w-full h-auto rounded-lg mx-auto"
                                loading="lazy"
                            />
                            {element.content && (
                                <p className="text-sm text-gray-500 mt-3 text-center">{element.content}</p>
                            )}
                        </div>
                    </div>
                );
                
            case 'video':
                return (
                    <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">🎬 Video</h3>
                        </div>
                        <div className="p-4">
                            <video controls className="w-full rounded-lg" controlsList="nodownload">
                                <source src={element.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {element.content && (
                                <p className="text-sm text-gray-500 mt-3">{element.content}</p>
                            )}
                        </div>
                    </div>
                );
                
            case 'audio':
                return (
                    <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">🎵 Audio</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">🎵</div>
                                <div className="flex-1">
                                    <audio controls className="w-full">
                                        <source src={element.url} />
                                        Your browser does not support the audio element.
                                    </audio>
                                    {element.content && (
                                        <p className="text-sm text-gray-500 mt-2">{element.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 'youtube':
                return (
                    <div key={index} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700">📺 YouTube Video</h3>
                        </div>
                        <div className="p-4">
                            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                                <ReactPlayer
                                    url={element.url}
                                    className="absolute top-0 left-0"
                                    width="100%"
                                    height="100%"
                                    controls
                                />
                            </div>
                            {element.content && (
                                <p className="text-sm text-gray-500 mt-3">{element.content}</p>
                            )}
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The content you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Interactive Classroom</h1>
                        <p className="text-blue-100 text-sm">{user?.role === 'student' ? 'Student Portal' : 'Teacher Portal'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white">Welcome, {user?.name}!</span>
                        <button
                            onClick={() => navigate(user?.role === 'student' ? '/student' : '/teacher')}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            ← Back to Dashboard
                        </button>
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

            {/* Content Body */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Content Header */}
                <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                        <p className="text-blue-100">
                            Subject: {getSubjectName(content.subject)}
                        </p>
                        {content.teacherId && (
                            <p className="text-blue-100 text-sm mt-2">
                                Uploaded by: {content.teacherId.name}
                            </p>
                        )}
                    </div>
                    
                    {content.description && (
                        <div className="p-6 bg-gray-50 border-b">
                            <h3 className="font-semibold text-gray-700 mb-2">📖 Description</h3>
                            <p className="text-gray-700">{content.description}</p>
                        </div>
                    )}
                    
                    <div className="p-4 bg-gray-50 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(content.createdAt).toLocaleDateString()}</span>
                        <span>📝 {content.elements?.filter(el => el.type === 'text').length || 0} text sections</span>
                        <span>🖼️ {content.elements?.filter(el => el.type === 'image').length || 0} images</span>
                        <span>🎬 {content.elements?.filter(el => el.type === 'video').length || 0} videos</span>
                        <span>🎵 {content.elements?.filter(el => el.type === 'audio').length || 0} audio files</span>
                        <span>📺 {content.elements?.filter(el => el.type === 'youtube').length || 0} YouTube videos</span>
                    </div>
                </div>

                {/* Content Elements */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
                        📚 Content
                    </h2>
                    {content.elements && content.elements.length > 0 ? (
                        content.elements
                            .sort((a, b) => a.order - b.order)
                            .map(renderElement)
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500">No content elements available.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2024 Interactive Classroom - All rights reserved</p>
                </div>
            </div>
        </div>
    );
};

export default ContentViewPage;