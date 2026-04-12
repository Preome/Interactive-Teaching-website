import React from 'react';
import ReactPlayer from 'react-player';

const ContentViewer = ({ content, onClose, isTeacher = false }) => {
    const renderElement = (element, index) => {
        switch (element.type) {
            case 'text':
                return (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                        <p className="text-gray-800 whitespace-pre-wrap">{element.content}</p>
                    </div>
                );
            case 'image':
                return (
                    <div key={index} className="mb-4">
                        <img src={element.url} alt={element.content} className="max-w-full rounded shadow" />
                    </div>
                );
            case 'video':
                return (
                    <div key={index} className="mb-4">
                        <video controls className="w-full rounded shadow">
                            <source src={element.url} />
                        </video>
                    </div>
                );
            case 'audio':
                return (
                    <div key={index} className="mb-4">
                        <audio controls className="w-full">
                            <source src={element.url} />
                        </audio>
                    </div>
                );
            case 'youtube':
                return (
                    <div key={index} className="mb-4 relative pb-[56.25%] h-0">
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
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">{content.title}</h2>
                        <p className="text-gray-600">Subject: {content.subject}</p>
                        {content.teacherId && (
                            <p className="text-sm text-gray-500">Uploaded by: {content.teacherId.name}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        ×
                    </button>
                </div>
                <div className="p-6">
                    {content.description && (
                        <div className="mb-6 p-4 bg-blue-50 rounded">
                            <p className="text-gray-700">{content.description}</p>
                        </div>
                    )}
                    <div className="space-y-6">
                        {content.elements?.sort((a, b) => a.order - b.order).map(renderElement)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentViewer;