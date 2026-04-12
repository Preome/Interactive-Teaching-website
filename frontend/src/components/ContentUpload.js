import React, { useState } from 'react';
import axios from 'axios';

const ContentUpload = ({ token, onUploadSuccess }) => {
    const [subject, setSubject] = useState('microsoft_word');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [elements, setElements] = useState([]);
    const [currentText, setCurrentText] = useState('');
    const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
    
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [selectedAudios, setSelectedAudios] = useState([]);
    
    const [uploading, setUploading] = useState(false);

    const addTextElement = () => {
        if (currentText.trim()) {
            setElements([...elements, { 
                type: 'text', 
                content: currentText, 
                order: elements.length 
            }]);
            setCurrentText('');
        }
    };

    const addYoutubeElement = () => {
        if (currentYoutubeUrl.trim()) {
            setElements([...elements, { 
                type: 'youtube', 
                url: currentYoutubeUrl, 
                content: currentYoutubeUrl,
                order: elements.length 
            }]);
            setCurrentYoutubeUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        const formData = new FormData();
        
        // Create elements array in the order files will be uploaded
        const elementsData = [...elements];
        
        // Track all files to upload
        const allFiles = [];
        
        // Add images
        if (selectedImages.length > 0) {
            selectedImages.forEach((file) => {
                allFiles.push(file);
                elementsData.push({
                    type: 'image',
                    content: file.name,
                    order: elementsData.length
                });
            });
        }
        
        // Add videos
        if (selectedVideos.length > 0) {
            selectedVideos.forEach((file) => {
                allFiles.push(file);
                elementsData.push({
                    type: 'video',
                    content: file.name,
                    order: elementsData.length
                });
            });
        }
        
        // Add audio
        if (selectedAudios.length > 0) {
            selectedAudios.forEach((file) => {
                allFiles.push(file);
                elementsData.push({
                    type: 'audio',
                    content: file.name,
                    order: elementsData.length
                });
            });
        }
        
        // Append all files to formData
        allFiles.forEach((file) => {
            formData.append('media', file);
        });
        
        formData.append('data', JSON.stringify({ 
            subject, 
            title, 
            description, 
            elements: elementsData 
        }));

        console.log('Uploading:', {
            textElements: elements.filter(e => e.type === 'text').length,
            youtubeElements: elements.filter(e => e.type === 'youtube').length,
            images: selectedImages.length,
            videos: selectedVideos.length,
            audios: selectedAudios.length,
            totalFiles: allFiles.length
        });

        try {
            const response = await axios.post('http://localhost:5000/api/content/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Upload success:', response.data);
            alert(`Success! Uploaded ${allFiles.length} file(s) successfully.`);
            
            // Reset form
            setTitle('');
            setDescription('');
            setElements([]);
            setSelectedImages([]);
            setSelectedVideos([]);
            setSelectedAudios([]);
            setCurrentText('');
            setCurrentYoutubeUrl('');
            
            onUploadSuccess();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading content: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    const removeTextElement = (index) => {
        setElements(elements.filter((_, i) => i !== index));
    };

    const removeYoutubeElement = (index) => {
        setElements(elements.filter((_, i) => i !== index));
    };

    const removeImage = (index) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const removeVideo = (index) => {
        setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    };

    const removeAudio = (index) => {
        setSelectedAudios(selectedAudios.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Upload New Content</h2>
            <form onSubmit={handleSubmit}>
                {/* Subject Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="microsoft_word">Microsoft Word</option>
                        <option value="excel">Excel</option>
                        <option value="powerpoint">PowerPoint</option>
                        <option value="internet">Internet</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Title */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                    />
                </div>

                <div className="border-t pt-4 mb-4">
                    <h3 className="font-bold text-lg mb-3">Add Content Elements</h3>
                    
                    {/* Text Addition */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-gray-700 font-medium mb-2">📝 Add Text</label>
                        <div className="flex gap-2">
                            <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Enter text content..."
                            />
                            <button
                                type="button"
                                onClick={addTextElement}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 h-fit"
                            >
                                Add Text
                            </button>
                        </div>
                        {elements.filter(el => el.type === 'text').map((el, idx) => (
                            <div key={idx} className="mt-2 p-2 bg-blue-50 rounded flex justify-between items-center">
                                <span className="text-sm">📝 {el.content.substring(0, 50)}...</span>
                                <button type="button" onClick={() => removeTextElement(elements.indexOf(el))} className="text-red-500">Remove</button>
                            </div>
                        ))}
                    </div>

                    {/* YouTube Link Addition */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-gray-700 font-medium mb-2">▶️ Add YouTube Video</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={currentYoutubeUrl}
                                onChange={(e) => setCurrentYoutubeUrl(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <button
                                type="button"
                                onClick={addYoutubeElement}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                            >
                                Add YouTube
                            </button>
                        </div>
                        {elements.filter(el => el.type === 'youtube').map((el, idx) => (
                            <div key={idx} className="mt-2 p-2 bg-red-50 rounded flex justify-between items-center">
                                <span className="text-sm">📺 {el.url}</span>
                                <button type="button" onClick={() => removeYoutubeElement(elements.indexOf(el))} className="text-red-500">Remove</button>
                            </div>
                        ))}
                    </div>

                    {/* Images Upload Section */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-gray-700 font-medium mb-2">🖼️ Upload Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                        />
                        {selectedImages.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Selected: {selectedImages.length} image(s)</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedImages.map((file, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center gap-2">
                                            🖼️ {file.name}
                                            <button type="button" onClick={() => removeImage(idx)} className="text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Videos Upload Section */}
                    <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <label className="block text-gray-700 font-medium mb-2">🎬 Upload Videos</label>
                        <input
                            type="file"
                            multiple
                            accept="video/*"
                            onChange={(e) => setSelectedVideos(Array.from(e.target.files))}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                        />
                        {selectedVideos.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Selected: {selectedVideos.length} video(s)</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedVideos.map((file, idx) => (
                                        <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm flex items-center gap-2">
                                            🎬 {file.name}
                                            <button type="button" onClick={() => removeVideo(idx)} className="text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Audio Upload Section */}
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <label className="block text-gray-700 font-medium mb-2">🎵 Upload Audio</label>
                        <input
                            type="file"
                            multiple
                            accept="audio/*"
                            onChange={(e) => setSelectedAudios(Array.from(e.target.files))}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                        />
                        {selectedAudios.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Selected: {selectedAudios.length} audio(s)</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedAudios.map((file, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm flex items-center gap-2">
                                            🎵 {file.name}
                                            <button type="button" onClick={() => removeAudio(idx)} className="text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                    {uploading ? 'Uploading...' : 'Upload Content'}
                </button>
            </form>
        </div>
    );
};

export default ContentUpload;