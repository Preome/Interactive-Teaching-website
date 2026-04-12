import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const ContentViewer = ({ content, onClose, isTeacher = false }) => {
    const [activePopup, setActivePopup] = useState(null);

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
            'other': 'Other Subjects'
        };
        return subjectNames[subject] || subject;
    };

    // Render Interactive Article
    const renderInteractiveArticle = (element, idx) => {
        const text = element.content;
        const interactiveItems = element.interactiveElements || [];
        
        // Function to split text and highlight words
        const renderTextWithHighlights = () => {
            if (!text) return [{ type: 'text', content: 'No content' }];
            
            let parts = [];
            let lastIndex = 0;
            
            // Sort items by position in text
            const sortedItems = [...interactiveItems].sort((a, b) => {
                const posA = text.toLowerCase().indexOf(a.word.toLowerCase());
                const posB = text.toLowerCase().indexOf(b.word.toLowerCase());
                return posA - posB;
            });
            
            sortedItems.forEach((item, itemIdx) => {
                const wordIndex = text.toLowerCase().indexOf(item.word.toLowerCase(), lastIndex);
                if (wordIndex !== -1) {
                    // Add text before the word
                    if (wordIndex > lastIndex) {
                        parts.push({
                            type: 'text',
                            content: text.substring(lastIndex, wordIndex)
                        });
                    }
                    // Add the interactive word
                    parts.push({
                        type: 'interactive',
                        content: text.substring(wordIndex, wordIndex + item.word.length),
                        word: item.word,
                        emoji: item.emoji || '📝',
                        mediaType: item.mediaType,
                        explanation: item.explanation,
                        mediaUrl: item.mediaUrl,
                        mediaFileName: item.mediaFileName,
                        index: itemIdx
                    });
                    lastIndex = wordIndex + item.word.length;
                }
            });
            
            // Add remaining text
            if (lastIndex < text.length) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex)
                });
            }
            
            return parts;
        };
        
        const parts = renderTextWithHighlights();
        
        return (
            <div key={idx} className="mb-6 p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <span className="text-2xl">📰</span>
                    <h3 className="font-bold text-lg text-gray-800">Interactive Article</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                        {interactiveItems.length} interactive word(s)
                    </span>
                </div>
                
                <div className="prose max-w-none leading-relaxed">
                    {parts.map((part, partIdx) => {
                        if (part.type === 'interactive') {
                            const isOpen = activePopup === `${idx}-${partIdx}`;
                            return (
                                <span key={partIdx} className="relative inline-block">
                                    <button
                                        onClick={() => setActivePopup(isOpen ? null : `${idx}-${partIdx}`)}
                                        className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 rounded-lg px-2 py-1 mx-0.5 transition cursor-pointer shadow-sm"
                                    >
                                        <span className="text-lg">{part.emoji}</span>
                                        <span className="font-semibold">{part.content}</span>
                                        {part.mediaType === 'image' && <span className="text-xs">🖼️</span>}
                                        {part.mediaType === 'video' && <span className="text-xs">🎬</span>}
                                        {part.mediaType === 'audio' && <span className="text-xs">🎵</span>}
                                        {part.mediaType === 'text' && <span className="text-xs">📝</span>}
                                    </button>
                                    
                                    {isOpen && (
                                        <div 
                                            className="absolute z-20 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border-2 overflow-hidden"
                                            style={{ left: '50%', transform: 'translateX(-50%)' }}
                                        >
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{part.emoji}</span>
                                                    <span className="font-bold">{part.word}</span>
                                                </div>
                                                <button
                                                    onClick={() => setActivePopup(null)}
                                                    className="text-white hover:text-gray-200 text-xl"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            
                                            <div className="p-4 max-h-96 overflow-y-auto">
                                                {part.mediaType === 'text' && (
                                                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {part.explanation || 'No explanation provided.'}
                                                    </div>
                                                )}
                                                
                                                {part.mediaType === 'image' && part.mediaUrl && (
                                                    <div>
                                                        <img 
                                                            src={part.mediaUrl} 
                                                            alt={part.word}
                                                            className="w-full rounded-lg shadow-md"
                                                            onError={(e) => {
                                                                console.error('Image failed to load:', part.mediaUrl);
                                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                                            }}
                                                        />
                                                        {part.explanation && (
                                                            <p className="text-sm text-gray-600 mt-3">{part.explanation}</p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {part.mediaType === 'video' && part.mediaUrl && (
                                                    <div>
                                                        <video controls className="w-full rounded-lg shadow-md">
                                                            <source src={part.mediaUrl} />
                                                            Your browser does not support video.
                                                        </video>
                                                        {part.explanation && (
                                                            <p className="text-sm text-gray-600 mt-3">{part.explanation}</p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {part.mediaType === 'audio' && part.mediaUrl && (
                                                    <div>
                                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                                            <div className="text-4xl">🎵</div>
                                                            <audio controls className="flex-1">
                                                                <source src={part.mediaUrl} />
                                                            </audio>
                                                        </div>
                                                        {part.explanation && (
                                                            <p className="text-sm text-gray-600 mt-3">{part.explanation}</p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {part.mediaType !== 'text' && !part.mediaUrl && (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <div className="text-4xl mb-2">⚠️</div>
                                                        <p>Media file not available</p>
                                                        <p className="text-xs mt-2">Please re-upload the content with the media file</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
                                                Click ✕ to close
                                            </div>
                                        </div>
                                    )}
                                </span>
                            );
                        }
                        return <span key={partIdx}>{part.content}</span>;
                    })}
                </div>
            </div>
        );
    };

    const renderElement = (element, index) => {
        switch (element.type) {
            case 'text':
                return (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{element.content}</p>
                    </div>
                );
                
            case 'interactive_text':
                return renderInteractiveArticle(element, index);
                
            case 'image':
                return (
                    <div key={index} className="mb-4">
                        <div className="bg-gray-100 rounded-lg p-2">
                            <img 
                                src={element.url} 
                                alt={element.content || 'Image'} 
                                className="max-w-full h-auto rounded shadow-lg mx-auto"
                                loading="lazy"
                            />
                            {element.content && (
                                <p className="text-sm text-gray-500 mt-2 text-center">{element.content}</p>
                            )}
                        </div>
                    </div>
                );
                
            case 'video':
                return (
                    <div key={index} className="mb-4">
                        <div className="bg-black rounded-lg overflow-hidden">
                            <video controls className="w-full">
                                <source src={element.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {element.content && (
                                <p className="text-sm text-gray-500 mt-2 p-2">{element.content}</p>
                            )}
                        </div>
                    </div>
                );
                
            case 'audio':
                return (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
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
                    <div key={index} className="mb-4">
                        <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-lg">
                            <ReactPlayer
                                url={element.url}
                                className="absolute top-0 left-0"
                                width="100%"
                                height="100%"
                                controls
                            />
                        </div>
                        {element.content && (
                            <p className="text-sm text-gray-500 mt-2">{element.content}</p>
                        )}
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{content.title}</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Subject: {getSubjectName(content.subject)}
                        </p>
                        {content.teacherId && (
                            <p className="text-xs text-gray-500 mt-1">
                                Uploaded by: {content.teacherId.name}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                    >
                        ×
                    </button>
                </div>
                
                {/* Content Body */}
                <div className="p-6">
                    {content.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-2">📖 Description</h3>
                            <p className="text-gray-700">{content.description}</p>
                        </div>
                    )}
                    
                    {/* Content Stats */}
                    <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600 border-b pb-3">
                        <span>📝 {content.elements?.filter(el => el.type === 'text').length || 0} texts</span>
                        <span>📰 {content.elements?.filter(el => el.type === 'interactive_text').length || 0} interactive articles</span>
                        <span>🖼️ {content.elements?.filter(el => el.type === 'image').length || 0} images</span>
                        <span>🎬 {content.elements?.filter(el => el.type === 'video').length || 0} videos</span>
                        <span>🎵 {content.elements?.filter(el => el.type === 'audio').length || 0} audio</span>
                        <span>📺 {content.elements?.filter(el => el.type === 'youtube').length || 0} YouTube</span>
                    </div>
                    
                    {content.elements && content.elements.length > 0 ? (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">📚 Content</h3>
                            {content.elements
                                .sort((a, b) => a.order - b.order)
                                .map(renderElement)}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No content elements added yet.</p>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentViewer;