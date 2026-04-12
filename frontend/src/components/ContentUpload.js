import React, { useState } from 'react';
import axios from 'axios';
import InteractiveArticleEditor from './InteractiveArticleEditor';

const ContentUpload = ({ token, onUploadSuccess, editingContent = null, isEditing = false }) => {
    const [subject, setSubject] = useState(editingContent?.subject || 'microsoft_word');
    const [title, setTitle] = useState(editingContent?.title || '');
    const [description, setDescription] = useState(editingContent?.description || '');
    const [elements, setElements] = useState(editingContent?.elements || []);
    const [currentText, setCurrentText] = useState('');
    const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
    const [contentType, setContentType] = useState(editingContent?.contentType || 'standard');
    const [showArticleEditor, setShowArticleEditor] = useState(false);
    
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [selectedAudios, setSelectedAudios] = useState([]);
    
    const [uploading, setUploading] = useState(false);

    const subjectOptions = {
        'bangla': '📖 Bangla (Bengali)',
        'english': '🇬🇧 English',
        'math': '🧮 Mathematics',
        'science': '🔬 Science',
        'physics': '⚡ Physics',
        'chemistry': '🧪 Chemistry',
        'biology': '🧬 Biology',
        'microsoft_word': '📄 Microsoft Word',
        'excel': '📊 Excel',
        'powerpoint': '📽️ PowerPoint',
        'internet': '🌐 Internet',
        'programming': '💻 Programming',
        'database': '🗄️ Database',
        'history': '🏛️ History',
        'geography': '🗺️ Geography',
        'economics': '💰 Economics',
        'civics': '⚖️ Civics',
        'bangla_article': '📰 বাংলা নিবন্ধ (Bangla Article)',
        'english_article': '📰 English Article',
        'news_article': '📰 News Article',
        'interactive_story': '📖 Interactive Story',
        'other': '📚 Other Subjects'
    };

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

    const addInteractiveArticle = (interactiveElement) => {
        setElements([...elements, interactiveElement]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        const formData = new FormData();
        
        // Create a deep copy of elements
        const elementsData = JSON.parse(JSON.stringify(elements));
        
        // Track all files to upload
        const allFiles = [];
        
        // Add regular images
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
        
        // Add regular videos
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
        
        // Add regular audio
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
        
        // IMPORTANT: Collect interactive media files from interactive articles
        // We need to go through each interactive article and collect the actual File objects
        for (let i = 0; i < elementsData.length; i++) {
            const element = elementsData[i];
            if (element.type === 'interactive_text' && element.interactiveElements) {
                for (let j = 0; j < element.interactiveElements.length; j++) {
                    const item = element.interactiveElements[j];
                    // Look for the corresponding File object in the original elements state
                    const originalElement = elements.find(el => el.type === 'interactive_text');
                    if (originalElement && originalElement.interactiveElements && originalElement.interactiveElements[j]) {
                        const originalItem = originalElement.interactiveElements[j];
                        if (originalItem.mediaFile && originalItem.mediaFile instanceof File) {
                            console.log('Adding interactive media file for word:', item.word, originalItem.mediaFile.name);
                            allFiles.push(originalItem.mediaFile);
                            // Clear blob URL - backend will assign real Cloudinary URL
                            item.mediaUrl = '';
                            item.mediaFileName = originalItem.mediaFile.name;
                        }
                    }
                }
            }
        }
        
        // Append all files to formData
        allFiles.forEach((file) => {
            formData.append('media', file);
        });
        
        // Clean up elements data - remove any File objects (they cause JSON.stringify error)
        const cleanElementsData = JSON.parse(JSON.stringify(elementsData, (key, value) => {
            // Skip File objects
            if (value instanceof File) {
                return undefined;
            }
            return value;
        }));
        
        formData.append('data', JSON.stringify({ 
            subject, 
            title, 
            description, 
            elements: cleanElementsData,
            contentType: contentType
        }));

        console.log('=== UPLOAD SUMMARY ===');
        console.log('Is Editing:', isEditing);
        console.log('Text elements:', elements.filter(e => e.type === 'text').length);
        console.log('Interactive articles:', elements.filter(e => e.type === 'interactive_text').length);
        console.log('YouTube videos:', elements.filter(e => e.type === 'youtube').length);
        console.log('Regular images:', selectedImages.length);
        console.log('Regular videos:', selectedVideos.length);
        console.log('Regular audio:', selectedAudios.length);
        console.log('Interactive media files:', allFiles.filter(f => f).length);
        console.log('Total files to upload:', allFiles.length);

        try {
            let response;
            if (isEditing && editingContent?._id) {
                response = await axios.put(`http://localhost:5000/api/content/update/${editingContent._id}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Content updated successfully!');
            } else {
                response = await axios.post('http://localhost:5000/api/content/upload', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Content uploaded successfully!');
            }
            
            console.log('Upload success:', response.data);
            
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
            alert('Error: ' + (error.response?.data?.error || error.message));
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

    const removeInteractiveElement = (index) => {
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
            <h2 className="text-2xl font-bold mb-6">
                {isEditing ? '✏️ Edit Content' : '📤 Upload New Content'}
            </h2>
            <form onSubmit={handleSubmit}>
                {/* Content Type Selection */}
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <label className="block text-gray-700 font-medium mb-2">Content Type</label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="standard"
                                checked={contentType === 'standard'}
                                onChange={(e) => setContentType(e.target.value)}
                                className="mr-2"
                            />
                            <span>📄 Standard Content (Text, Images, Videos)</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="interactive_article"
                                checked={contentType === 'interactive_article'}
                                onChange={(e) => setContentType(e.target.value)}
                                className="mr-2"
                            />
                            <span>📰 Interactive Article (News with Clickable Emojis)</span>
                        </label>
                    </div>
                </div>

                {/* Subject Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <optgroup label="📚 Academic Subjects">
                            <option value="bangla">📖 Bangla (Bengali)</option>
                            <option value="english">🇬🇧 English</option>
                            <option value="math">🧮 Mathematics</option>
                            <option value="science">🔬 Science</option>
                            <option value="physics">⚡ Physics</option>
                            <option value="chemistry">🧪 Chemistry</option>
                            <option value="biology">🧬 Biology</option>
                        </optgroup>
                        <optgroup label="💻 Computer & IT">
                            <option value="microsoft_word">📄 Microsoft Word</option>
                            <option value="excel">📊 Excel</option>
                            <option value="powerpoint">📽️ PowerPoint</option>
                            <option value="internet">🌐 Internet</option>
                            <option value="programming">💻 Programming</option>
                            <option value="database">🗄️ Database</option>
                        </optgroup>
                        <optgroup label="🏛️ Social Studies">
                            <option value="history">🏛️ History</option>
                            <option value="geography">🗺️ Geography</option>
                            <option value="economics">💰 Economics</option>
                            <option value="civics">⚖️ Civics</option>
                        </optgroup>
                        <optgroup label="📰 Interactive Articles">
                            <option value="bangla_article">📰 বাংলা নিবন্ধ (Bangla Article)</option>
                            <option value="english_article">📰 English Article</option>
                            <option value="news_article">📰 News Article</option>
                            <option value="interactive_story">📖 Interactive Story</option>
                        </optgroup>
                        <option value="other">📚 Other Subjects</option>
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
                        placeholder="Enter content title..."
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
                        placeholder="Enter a brief description..."
                    />
                </div>

                <div className="border-t pt-4 mb-4">
                    <h3 className="font-bold text-lg mb-3">Add Content Elements</h3>
                    
                    {/* Interactive Article Button */}
                    {contentType === 'interactive_article' && (
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => setShowArticleEditor(true)}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                                <span className="text-2xl">📰</span>
                                Create Interactive Article
                            </button>
                        </div>
                    )}
                    
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

                    {/* Interactive Elements Display */}
                    {elements.filter(el => el.type === 'interactive_text').length > 0 && (
                        <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                            <h4 className="font-bold mb-2">📰 Interactive Articles ({elements.filter(el => el.type === 'interactive_text').length})</h4>
                            {elements.filter(el => el.type === 'interactive_text').map((el, idx) => (
                                <div key={idx} className="mt-2 p-2 bg-indigo-100 rounded flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-medium">Interactive Article</span>
                                        <p className="text-xs text-gray-600">{el.content?.substring(0, 100)}...</p>
                                        <p className="text-xs text-indigo-600 mt-1">
                                            {el.interactiveElements?.length || 0} interactive elements
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => removeInteractiveElement(elements.indexOf(el))} className="text-red-500">Remove</button>
                                </div>
                            ))}
                        </div>
                    )}

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

                    {/* Summary of all elements */}
                    {(elements.length > 0 || selectedImages.length > 0 || selectedVideos.length > 0 || selectedAudios.length > 0) && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 className="font-bold mb-2">📋 Content Summary</h4>
                            <div className="space-y-1 text-sm">
                                {elements.filter(el => el.type === 'text').length > 0 && (
                                    <p>📝 Text sections: {elements.filter(el => el.type === 'text').length}</p>
                                )}
                                {elements.filter(el => el.type === 'interactive_text').length > 0 && (
                                    <p>📰 Interactive articles: {elements.filter(el => el.type === 'interactive_text').length}</p>
                                )}
                                {elements.filter(el => el.type === 'youtube').length > 0 && (
                                    <p>📺 YouTube videos: {elements.filter(el => el.type === 'youtube').length}</p>
                                )}
                                {selectedImages.length > 0 && <p>🖼️ Images to upload: {selectedImages.length}</p>}
                                {selectedVideos.length > 0 && <p>🎬 Videos to upload: {selectedVideos.length}</p>}
                                {selectedAudios.length > 0 && <p>🎵 Audio files to upload: {selectedAudios.length}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                    {uploading ? 'Processing...' : (isEditing ? '✏️ Update Content' : '📤 Upload Content')}
                </button>
            </form>

            {/* Interactive Article Editor Modal */}
            {showArticleEditor && (
                <InteractiveArticleEditor
                    onAddInteractiveText={addInteractiveArticle}
                    onClose={() => setShowArticleEditor(false)}
                />
            )}
        </div>
    );
};

export default ContentUpload;