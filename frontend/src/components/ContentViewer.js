import React from 'react';
import ReactPlayer from 'react-player';

const ContentViewer = ({ content, onClose, isTeacher = false }) => {
    const renderElement = (element, index) => {
        switch (element.type) {
            case 'text':
                return (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{element.content}</p>
                    </div>
                );
                
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
                            <video controls className="w-full" poster="/video-poster.jpg">
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
                                config={{
                                    youtube: {
                                        playerVars: { showinfo: 1 }
                                    }
                                }}
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

    // Get subject name for display
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
                    <div className="mb-6 flex gap-4 text-sm text-gray-600 border-b pb-3">
                        <span>📝 {content.elements?.filter(el => el.type === 'text').length || 0} texts</span>
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