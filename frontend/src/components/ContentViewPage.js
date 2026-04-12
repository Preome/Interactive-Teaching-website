import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';

const ContentViewPage = ({ token, user }) => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState(null);
    const [activeInteractivePopup, setActiveInteractivePopup] = useState(null);

    const fetchContent = useCallback(async () => {
        try {
            console.log('Fetching content:', contentId);
            const response = await axios.get(`http://localhost:5000/api/content/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Content received:', response.data);
            setContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching content:', error);
            setError('Failed to load content');
            setLoading(false);
        }
    }, [contentId, token]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const toggleSection = (section) => {
        if (activeSection === section) {
            setActiveSection(null);
        } else {
            setActiveSection(section);
        }
    };

    const getSubjectName = (subject) => {
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
        return subjectNames[subject] || subject;
    };

    const getElementsByType = (type) => {
        if (!content || !content.elements) return [];
        if (type === 'images') {
            return content.elements.filter(el => el.type === 'image' && el.url);
        }
        if (type === 'videos') {
            return content.elements.filter(el => el.type === 'video' && el.url);
        }
        if (type === 'audio') {
            return content.elements.filter(el => el.type === 'audio' && el.url);
        }
        return content.elements.filter(el => el.type === type);
    };

    const getContentCounts = () => {
        if (!content || !content.elements) {
            return { text: 0, images: 0, videos: 0, audio: 0, youtube: 0, interactive: 0 };
        }
        return {
            text: content.elements.filter(el => el.type === 'text').length,
            images: content.elements.filter(el => el.type === 'image' && el.url).length,
            videos: content.elements.filter(el => el.type === 'video' && el.url).length,
            audio: content.elements.filter(el => el.type === 'audio' && el.url).length,
            youtube: content.elements.filter(el => el.type === 'youtube').length,
            interactive: content.elements.filter(el => el.type === 'interactive_text').length
        };
    };

    // Component for Interactive Article Popup
    const InteractiveWord = ({ segment, popupState, setPopupState, segIdx }) => {
        const isOpen = popupState === segIdx;
        
        return (
            <span className="relative inline-block">
                <button
                    onClick={() => setPopupState(isOpen ? null : segIdx)}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 rounded-lg px-2 py-1 mx-0.5 transition cursor-pointer shadow-sm"
                >
                    <span className="text-lg">{segment.emoji}</span>
                    <span className="font-semibold">{segment.content}</span>
                    {segment.mediaType === 'image' && <span className="text-xs">🖼️</span>}
                    {segment.mediaType === 'video' && <span className="text-xs">🎬</span>}
                    {segment.mediaType === 'audio' && <span className="text-xs">🎵</span>}
                    {segment.mediaType === 'text' && <span className="text-xs">📝</span>}
                </button>
                
                {isOpen && (
                    <div 
                        className="absolute z-20 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border-2 overflow-hidden animate-fadeIn"
                        style={{ left: '50%', transform: 'translateX(-50%)' }}
                    >
                        {/* Popup Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{segment.emoji}</span>
                                <span className="font-bold">{segment.word}</span>
                            </div>
                            <button
                                onClick={() => setPopupState(null)}
                                className="text-white hover:text-gray-200 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Popup Content based on media type */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {segment.mediaType === 'text' && (
                                <div>
                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {segment.explanation || 'No explanation provided.'}
                                    </div>
                                </div>
                            )}
                            
                            {segment.mediaType === 'image' && segment.mediaUrl && (
                                <div>
                                    <img 
                                        src={segment.mediaUrl} 
                                        alt={segment.word}
                                        className="w-full rounded-lg shadow-md"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                    />
                                    {segment.explanation && (
                                        <p className="text-sm text-gray-600 mt-3">{segment.explanation}</p>
                                    )}
                                </div>
                            )}
                            
                            {segment.mediaType === 'video' && segment.mediaUrl && (
                                <div>
                                    <video 
                                        controls 
                                        className="w-full rounded-lg shadow-md"
                                        controlsList="nodownload"
                                    >
                                        <source src={segment.mediaUrl} />
                                        Your browser does not support video.
                                    </video>
                                    {segment.explanation && (
                                        <p className="text-sm text-gray-600 mt-3">{segment.explanation}</p>
                                    )}
                                </div>
                            )}
                            
                            {segment.mediaType === 'audio' && segment.mediaUrl && (
                                <div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-4xl">🎵</div>
                                        <audio controls className="flex-1">
                                            <source src={segment.mediaUrl} />
                                            Your browser does not support audio.
                                        </audio>
                                    </div>
                                    {segment.explanation && (
                                        <p className="text-sm text-gray-600 mt-3">{segment.explanation}</p>
                                    )}
                                </div>
                            )}

                            {(segment.mediaType === 'image' || segment.mediaType === 'video' || segment.mediaType === 'audio') && !segment.mediaUrl && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">📁</div>
                                    <p>Media file not available</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Popup Footer */}
                        <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
                            Click ✕ or outside to close
                        </div>
                    </div>
                )}
            </span>
        );
    };

    // Component for rendering Interactive Article
    const InteractiveArticle = ({ element, elementIndex }) => {
        const [popupState, setPopupState] = useState(null);
        
        const text = element.content;
        const interactiveItems = element.interactiveElements || [];
        
        // Split text and highlight interactive words
        let segments = [];
        let lastIndex = 0;
        
        // Create a copy of interactive items and sort by position
        const sortedItems = [...interactiveItems].sort((a, b) => {
            const posA = text.toLowerCase().indexOf(a.word.toLowerCase());
            const posB = text.toLowerCase().indexOf(b.word.toLowerCase());
            return posA - posB;
        });
        
        sortedItems.forEach((item) => {
            const wordIndex = text.toLowerCase().indexOf(item.word.toLowerCase(), lastIndex);
            if (wordIndex !== -1) {
                // Add text before the word
                if (wordIndex > lastIndex) {
                    segments.push({
                        type: 'text',
                        content: text.substring(lastIndex, wordIndex)
                    });
                }
                // Add the interactive word
                segments.push({
                    type: 'interactive',
                    content: text.substring(wordIndex, wordIndex + item.word.length),
                    word: item.word,
                    emoji: item.emoji,
                    mediaType: item.mediaType,
                    explanation: item.explanation,
                    mediaUrl: item.mediaUrl,
                    mediaFile: item.mediaFile
                });
                lastIndex = wordIndex + item.word.length;
            }
        });
        
        // Add remaining text
        if (lastIndex < text.length) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }
        
        return (
            <div key={elementIndex} className="mb-6 p-6 bg-white rounded-lg shadow-md">
                <div className="prose max-w-none">
                    {segments.map((segment, segIdx) => {
                        if (segment.type === 'interactive') {
                            return (
                                <InteractiveWord
                                    key={segIdx}
                                    segment={segment}
                                    popupState={popupState}
                                    setPopupState={setPopupState}
                                    segIdx={segIdx}
                                />
                            );
                        }
                        return <span key={segIdx}>{segment.content}</span>;
                    })}
                </div>
            </div>
        );
    };

    const renderContentByType = () => {
        if (!activeSection) return null;
        
        const elements = getElementsByType(activeSection);
        
        if (elements.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <p>No {activeSection} content available</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn">
                {elements.map((element, idx) => {
                    switch (activeSection) {
                        case 'text':
                            return (
                                <div key={idx} className="p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{element.content}</p>
                                </div>
                            );
                        case 'images':
                            return (
                                <div key={idx} className="bg-gray-100 rounded-lg p-4">
                                    <img 
                                        src={element.url} 
                                        alt={element.content || 'Image'} 
                                        className="max-w-full h-auto rounded-lg mx-auto shadow-md"
                                        loading="lazy"
                                        onError={(e) => {
                                            console.error('Image failed to load:', element.url);
                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        }}
                                    />
                                    {element.content && (
                                        <p className="text-sm text-gray-500 mt-3 text-center">{element.content}</p>
                                    )}
                                </div>
                            );
                        case 'videos':
                            return (
                                <div key={idx} className="bg-black rounded-lg overflow-hidden shadow-lg">
                                    <video controls className="w-full">
                                        <source src={element.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    {element.content && (
                                        <p className="text-sm text-gray-300 mt-2 p-3">{element.content}</p>
                                    )}
                                </div>
                            );
                        case 'audio':
                            return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">🎵</div>
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
                            );
                        case 'youtube':
                            return (
                                <div key={idx} className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-lg">
                                    <ReactPlayer
                                        url={element.url}
                                        className="absolute top-0 left-0"
                                        width="100%"
                                        height="100%"
                                        controls
                                    />
                                </div>
                            );
                        case 'interactive':
                            return <InteractiveArticle key={idx} element={element} elementIndex={idx} />;
                        default:
                            return null;
                    }
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    <p className="mt-6 text-gray-600 text-lg">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="text-7xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Content Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The content you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const counts = getContentCounts();
    const hasAnyContent = counts.text > 0 || counts.images > 0 || counts.videos > 0 || counts.audio > 0 || counts.youtube > 0 || counts.interactive > 0;

    const sections = [
        { id: 'text', icon: '📝', name: 'Text Content', color: 'bg-blue-500', count: counts.text },
        { id: 'images', icon: '🖼️', name: 'Images', color: 'bg-green-500', count: counts.images },
        { id: 'videos', icon: '🎬', name: 'Videos', color: 'bg-purple-500', count: counts.videos },
        { id: 'audio', icon: '🎵', name: 'Audio', color: 'bg-yellow-500', count: counts.audio },
        { id: 'youtube', icon: '📺', name: 'YouTube Videos', color: 'bg-red-500', count: counts.youtube },
        { id: 'interactive', icon: '📰', name: 'Interactive Articles', color: 'bg-indigo-500', count: counts.interactive }
    ];

    const availableSections = sections.filter(section => section.count > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-lg sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">📚</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Interactive Classroom</h1>
                            <p className="text-gray-500 text-sm">Content Viewer</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user?.name}!</span>
                        <button
                            onClick={() => navigate('/student')}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
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
                {/* Content Info Card */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{content.title}</h1>
                        <p className="text-blue-100">Subject: {getSubjectName(content.subject)}</p>
                        {content.teacherId && (
                            <p className="text-blue-100 text-sm mt-2 flex items-center gap-2">
                                <span>👨‍🏫</span> Teacher: {content.teacherId.name}
                            </p>
                        )}
                        <p className="text-blue-100 text-xs mt-2">
                            📅 Uploaded: {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    
                    {content.description && (
                        <div className="p-5 bg-gray-50 border-b">
                            <p className="text-gray-700">{content.description}</p>
                        </div>
                    )}
                </div>

                {/* Interactive Emoji Buttons */}
                {hasAnyContent ? (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            🎯 Click on any emoji to explore the content
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            {availableSections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => toggleSection(section.id)}
                                    className={`${section.color} text-white p-4 rounded-xl transition transform hover:scale-105 hover:shadow-xl ${
                                        activeSection === section.id ? 'ring-4 ring-offset-2 ring-blue-400 shadow-lg' : ''
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{section.icon}</div>
                                    <div className="font-semibold text-xs">{section.name}</div>
                                    <div className="text-xs mt-1 opacity-90">{section.count} item(s)</div>
                                    {activeSection === section.id && (
                                        <div className="mt-1 text-xs bg-white bg-opacity-20 rounded-full px-1 py-0.5 inline-block">
                                            ▼
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Display Content Based on Active Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[300px]">
                            {activeSection ? (
                                <>
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {sections.find(s => s.id === activeSection)?.name}
                                        </h3>
                                        <button
                                            onClick={() => setActiveSection(null)}
                                            className="text-gray-400 hover:text-gray-600 transition"
                                        >
                                            Close ✕
                                        </button>
                                    </div>
                                    {renderContentByType()}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">👆</div>
                                    <p className="text-gray-500 text-lg">Click on any emoji button above to view content</p>
                                    <p className="text-gray-400 text-sm mt-2">Choose what you want to learn!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500 text-lg">No content available in this lesson.</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for updates!</p>
                    </div>
                )}

                {/* Debug Info */}
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
                    <details>
                        <summary className="cursor-pointer font-bold">Debug Info (Click to expand)</summary>
                        <pre className="mt-2 overflow-auto">
                            {JSON.stringify({
                                contentId: contentId,
                                title: content.title,
                                contentType: content.contentType,
                                elementsCount: content.elements?.length,
                                elements: content.elements?.map(el => ({ 
                                    type: el.type, 
                                    hasUrl: !!el.url,
                                    interactiveCount: el.interactiveElements?.length || 0
                                }))
                            }, null, 2)}
                        </pre>
                    </details>
                </div>

                {/* Footer Tip */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>💡 Tip: Click on highlighted words with emojis to see images, videos, and explanations!</p>
                </div>
            </div>
        </div>
    );
};

export default ContentViewPage;