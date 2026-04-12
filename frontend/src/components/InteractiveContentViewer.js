import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const InteractiveContentViewer = ({ content, onClose }) => {
    const [expandedSections, setExpandedSections] = useState({
        text: false,
        images: false,
        videos: false,
        audio: false,
        youtube: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
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

    // Group elements by type
    const groupedElements = {
        text: content.elements?.filter(el => el.type === 'text') || [],
        images: content.elements?.filter(el => el.type === 'image') || [],
        videos: content.elements?.filter(el => el.type === 'video') || [],
        audio: content.elements?.filter(el => el.type === 'audio') || [],
        youtube: content.elements?.filter(el => el.type === 'youtube') || []
    };

    const sectionIcons = {
        text: { icon: '📝', name: 'Text Content', color: 'bg-blue-500', count: groupedElements.text.length },
        images: { icon: '🖼️', name: 'Images', color: 'bg-green-500', count: groupedElements.images.length },
        videos: { icon: '🎬', name: 'Videos', color: 'bg-purple-500', count: groupedElements.videos.length },
        audio: { icon: '🎵', name: 'Audio', color: 'bg-yellow-500', count: groupedElements.audio.length },
        youtube: { icon: '📺', name: 'YouTube Videos', color: 'bg-red-500', count: groupedElements.youtube.length }
    };

    const renderContent = (type) => {
        const elements = groupedElements[type];
        if (elements.length === 0) return null;

        return (
            <div className="space-y-4">
                {elements.map((element, idx) => {
                    switch (type) {
                        case 'text':
                            return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-800 whitespace-pre-wrap">{element.content}</p>
                                </div>
                            );
                        case 'images':
                            return (
                                <div key={idx} className="bg-gray-100 rounded-lg p-2">
                                    <img 
                                        src={element.url} 
                                        alt={element.content || 'Image'} 
                                        className="max-w-full h-auto rounded-lg mx-auto"
                                        loading="lazy"
                                    />
                                    {element.content && (
                                        <p className="text-sm text-gray-500 mt-2 text-center">{element.content}</p>
                                    )}
                                </div>
                            );
                        case 'videos':
                            return (
                                <div key={idx} className="bg-black rounded-lg overflow-hidden">
                                    <video controls className="w-full">
                                        <source src={element.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    {element.content && (
                                        <p className="text-sm text-gray-500 mt-2 p-2">{element.content}</p>
                                    )}
                                </div>
                            );
                        case 'audio':
                            return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
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
                                <div key={idx} className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                                    <ReactPlayer
                                        url={element.url}
                                        className="absolute top-0 left-0"
                                        width="100%"
                                        height="100%"
                                        controls
                                    />
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        );
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
                    {/* Description */}
                    {content.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-2">📖 Description</h3>
                            <p className="text-gray-700">{content.description}</p>
                        </div>
                    )}

                    {/* Interactive Section Buttons */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Click on any section to explore:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(sectionIcons).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleSection(key)}
                                    className={`${section.color} text-white p-4 rounded-lg transition transform hover:scale-105 ${
                                        expandedSections[key] ? 'ring-4 ring-offset-2 ring-blue-400' : ''
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{section.icon}</div>
                                    <div className="text-sm font-medium">{section.name}</div>
                                    <div className="text-xs mt-1">{section.count} items</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expanded Sections */}
                    <div className="space-y-6">
                        {expandedSections.text && groupedElements.text.length > 0 && (
                            <div className="border rounded-lg overflow-hidden animate-fadeIn">
                                <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">📝</span>
                                        <h3 className="font-bold">Text Content</h3>
                                        <span className="bg-white text-blue-500 px-2 py-1 rounded-full text-xs ml-2">
                                            {groupedElements.text.length}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleSection('text')} className="text-white hover:text-gray-200">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4">
                                    {renderContent('text')}
                                </div>
                            </div>
                        )}

                        {expandedSections.images && groupedElements.images.length > 0 && (
                            <div className="border rounded-lg overflow-hidden animate-fadeIn">
                                <div className="bg-green-500 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🖼️</span>
                                        <h3 className="font-bold">Images</h3>
                                        <span className="bg-white text-green-500 px-2 py-1 rounded-full text-xs ml-2">
                                            {groupedElements.images.length}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleSection('images')} className="text-white hover:text-gray-200">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderContent('images')}
                                </div>
                            </div>
                        )}

                        {expandedSections.videos && groupedElements.videos.length > 0 && (
                            <div className="border rounded-lg overflow-hidden animate-fadeIn">
                                <div className="bg-purple-500 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🎬</span>
                                        <h3 className="font-bold">Videos</h3>
                                        <span className="bg-white text-purple-500 px-2 py-1 rounded-full text-xs ml-2">
                                            {groupedElements.videos.length}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleSection('videos')} className="text-white hover:text-gray-200">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {renderContent('videos')}
                                </div>
                            </div>
                        )}

                        {expandedSections.audio && groupedElements.audio.length > 0 && (
                            <div className="border rounded-lg overflow-hidden animate-fadeIn">
                                <div className="bg-yellow-500 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🎵</span>
                                        <h3 className="font-bold">Audio</h3>
                                        <span className="bg-white text-yellow-500 px-2 py-1 rounded-full text-xs ml-2">
                                            {groupedElements.audio.length}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleSection('audio')} className="text-white hover:text-gray-200">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {renderContent('audio')}
                                </div>
                            </div>
                        )}

                        {expandedSections.youtube && groupedElements.youtube.length > 0 && (
                            <div className="border rounded-lg overflow-hidden animate-fadeIn">
                                <div className="bg-red-500 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">📺</span>
                                        <h3 className="font-bold">YouTube Videos</h3>
                                        <span className="bg-white text-red-500 px-2 py-1 rounded-full text-xs ml-2">
                                            {groupedElements.youtube.length}
                                        </span>
                                    </div>
                                    <button onClick={() => toggleSection('youtube')} className="text-white hover:text-gray-200">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-6">
                                    {renderContent('youtube')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* No content message */}
                    {Object.values(groupedElements).every(arr => arr.length === 0) && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No content available in this lesson.</p>
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

export default InteractiveContentViewer;