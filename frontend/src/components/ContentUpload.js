import React, { useState } from 'react';
import axios from 'axios';

const ContentUpload = ({ token, onUploadSuccess }) => {
    const [subject, setSubject] = useState('microsoft_word');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [elements, setElements] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
    const [files, setFiles] = useState([]);

    const addTextElement = () => {
        if (currentText.trim()) {
            setElements([...elements, { type: 'text', content: currentText, order: elements.length }]);
            setCurrentText('');
        }
    };

    const addYoutubeElement = () => {
        if (currentYoutubeUrl.trim()) {
            setElements([...elements, { type: 'youtube', url: currentYoutubeUrl, order: elements.length }]);
            setCurrentYoutubeUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('data', JSON.stringify({ subject, title, description, elements }));
        
        for (let i = 0; i < files.length; i++) {
            formData.append('media', files[i]);
        }

        try {
            await axios.post('http://localhost:5000/api/content/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Content uploaded successfully!');
            setTitle('');
            setDescription('');
            setElements([]);
            setFiles([]);
            onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading content');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Upload New Content</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                    >
                        <option value="microsoft_word">Microsoft Word</option>
                        <option value="excel">Excel</option>
                        <option value="powerpoint">PowerPoint</option>
                        <option value="internet">Internet</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows="3"
                    />
                </div>

                <div className="mb-4 border-t pt-4">
                    <h3 className="font-bold mb-3">Add Content Elements</h3>
                    
                    {/* Text Addition */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Add Text</label>
                        <div className="flex gap-2">
                            <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg"
                                rows="3"
                                placeholder="Enter text content..."
                            />
                            <button
                                type="button"
                                onClick={addTextElement}
                                className="bg-green-500 text-white px-4 py-2 rounded h-fit"
                            >
                                Add Text
                            </button>
                        </div>
                    </div>

                    {/* YouTube Link Addition */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Add YouTube Video</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={currentYoutubeUrl}
                                onChange={(e) => setCurrentYoutubeUrl(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg"
                                placeholder="YouTube URL"
                            />
                            <button
                                type="button"
                                onClick={addYoutubeElement}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Add YouTube
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Upload Images/Videos/Audio</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*"
                            onChange={(e) => setFiles(Array.from(e.target.files))}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    {/* Elements Preview */}
                    {elements.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded">
                            <h4 className="font-bold mb-2">Elements to be uploaded ({elements.length})</h4>
                            {elements.map((el, idx) => (
                                <div key={idx} className="text-sm text-gray-600 mb-1">
                                    {el.type === 'text' ? `📝 Text: ${el.content.substring(0, 50)}...` :
                                     el.type === 'youtube' ? `📺 YouTube: ${el.url}` : ''}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                    Upload Content
                </button>
            </form>
        </div>
    );
};

export default ContentUpload;