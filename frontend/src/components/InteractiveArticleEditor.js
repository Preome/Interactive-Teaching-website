import React, { useState } from 'react';

const InteractiveArticleEditor = ({ onAddInteractiveText, onClose }) => {
    const [articleText, setArticleText] = useState('');
    const [interactiveWords, setInteractiveWords] = useState([]);
    const [selectedWord, setSelectedWord] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📝');
    const [mediaType, setMediaType] = useState('text');
    const [explanation, setExplanation] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaFileName, setMediaFileName] = useState('');

    const allEmojis = [
        '📝', '📖', '🔍', '💡', '⭐', '🎯', '📌', '🔔', '💎', '🌟',
        '📰', '🗞️', '📺', '🎬', '🎵', '🖼️', '📷', '🎨', '🔬', '🧪',
        '📊', '📈', '💰', '🏆', '🎉', '✨', '💪', '🤔', '😮', '👍',
        '👮', '🕵️', '👨‍🏫', '👩‍🎓', '🏥', '🚗', '✈️', '🌍', '🏠', '❤️'
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaFileName(file.name);
            // Create temporary URL for preview
            const url = URL.createObjectURL(file);
            setMediaUrl(url);
        }
    };

    const addInteractiveWord = () => {
        // Validation
        if (!selectedWord.trim()) {
            alert('Please enter a word from your article');
            return;
        }

        // Check if word exists in article text
        if (!articleText.toLowerCase().includes(selectedWord.toLowerCase())) {
            alert(`The word "${selectedWord}" was not found in your article text. Please make sure it matches exactly.`);
            return;
        }

        // For text type, explanation is required
        if (mediaType === 'text' && !explanation.trim()) {
            alert('Please enter an explanation for this word');
            return;
        }

        // For media types, file is required
        if (mediaType !== 'text' && !mediaFile) {
            alert(`Please upload a ${mediaType} file for this word`);
            return;
        }

        const newInteractiveWord = {
            word: selectedWord.trim(),
            emoji: selectedEmoji,
            mediaType: mediaType,
            explanation: mediaType === 'text' ? explanation : '',
            mediaUrl: mediaUrl,
            mediaFile: mediaFile, // Keep the actual file object for upload
            mediaFileName: mediaFileName,
            timestamp: Date.now()
        };

        setInteractiveWords([...interactiveWords, newInteractiveWord]);
        
        // Reset form for next word
        setSelectedWord('');
        setSelectedEmoji('📝');
        setMediaType('text');
        setExplanation('');
        setMediaUrl('');
        setMediaFile(null);
        setMediaFileName('');
        
        // Reset file input
        const fileInput = document.getElementById('media-file-input');
        if (fileInput) fileInput.value = '';
    };

    const removeInteractiveWord = (index) => {
        setInteractiveWords(interactiveWords.filter((_, i) => i !== index));
    };

    const insertInteractiveText = () => {
        // Validation
        if (!articleText.trim()) {
            alert('Please enter your article text');
            return;
        }

        if (interactiveWords.length === 0) {
            alert('Please add at least one interactive word to your article');
            return;
        }

        // Create the interactive element with all data
        const interactiveElement = {
            type: 'interactive_text',
            content: articleText,
            interactiveElements: interactiveWords.map(item => ({
                word: item.word,
                emoji: item.emoji,
                mediaType: item.mediaType,
                explanation: item.explanation,
                mediaUrl: item.mediaUrl,
                mediaFile: item.mediaFile,
                mediaFileName: item.mediaFileName
            })),
            order: 0
        };

        onAddInteractiveText(interactiveElement);
        onClose();
    };

    // Function to preview how the article will look
    const getPreviewText = () => {
        if (!articleText) return '';
        
        let preview = articleText;
        interactiveWords.forEach(item => {
            const regex = new RegExp(`(${item.word})`, 'gi');
            const mediaIcon = item.mediaType === 'image' ? '🖼️' : 
                             item.mediaType === 'video' ? '🎬' :
                             item.mediaType === 'audio' ? '🎵' : '📝';
            preview = preview.replace(regex, `${item.emoji} ${mediaIcon} $1 ${item.emoji}`);
        });
        return preview;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">📰 Create Interactive Article</h2>
                        <p className="text-sm text-gray-500 mt-1">Add clickable words that reveal images, videos, audio, or explanations</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
                
                <div className="p-6">
                    {/* Instructions */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-200">
                        <p className="font-bold mb-1">📖 How to create an interactive article:</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Write or paste your article text below</li>
                            <li>Select a word from your article and choose what happens when clicked</li>
                            <li>Add text explanation OR upload an image/video/audio file</li>
                            <li>Repeat for multiple words in your article</li>
                            <li>Students will click on highlighted words to see your content!</li>
                        </ol>
                    </div>

                    {/* Article Text Input */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                            📄 Article Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={articleText}
                            onChange={(e) => setArticleText(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="6"
                            placeholder="Enter your news article, story, or educational content here...
Example: বাংলাদেশ একটি সুন্দর দেশ। ঢাকা এর রাজধানী। কক্সবাজার বিশ্বের দীর্ঘতম সমুদ্র সৈকত।"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {articleText.split(/\s+/).length} words, {articleText.length} characters
                        </p>
                    </div>

                    {/* Add Interactive Word Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-bold mb-3 text-lg">🎯 Add Interactive Element to a Word</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Word Selection */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Word from Article <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={selectedWord}
                                    onChange={(e) => setSelectedWord(e.target.value)}
                                    placeholder="Type a word from your article (e.g., বাংলাদেশ)"
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    list="word-suggestions"
                                />
                                <datalist id="word-suggestions">
                                    {articleText.split(/\s+/).map((word, idx) => {
                                        const cleanWord = word.replace(/[^\w\u0980-\u09FF]/g, '');
                                        if (cleanWord.length > 1) {
                                            return <option key={idx} value={cleanWord} />;
                                        }
                                        return null;
                                    })}
                                </datalist>
                            </div>

                            {/* Emoji Selection */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Choose Emoji <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2 border rounded p-2 max-h-24 overflow-y-auto bg-white">
                                    {allEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`text-2xl p-2 rounded transition ${selectedEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Media Type Selection */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-600 mb-1">What happens when clicked? <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="text"
                                            checked={mediaType === 'text'}
                                            onChange={(e) => setMediaType(e.target.value)}
                                            className="mr-1"
                                        />
                                        <span>📝 Show Text Explanation</span>
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="image"
                                            checked={mediaType === 'image'}
                                            onChange={(e) => setMediaType(e.target.value)}
                                            className="mr-1"
                                        />
                                        <span>🖼️ Show Image</span>
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="video"
                                            checked={mediaType === 'video'}
                                            onChange={(e) => setMediaType(e.target.value)}
                                            className="mr-1"
                                        />
                                        <span>🎬 Show Video</span>
                                    </label>
                                    <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            value="audio"
                                            checked={mediaType === 'audio'}
                                            onChange={(e) => setMediaType(e.target.value)}
                                            className="mr-1"
                                        />
                                        <span>🎵 Play Audio</span>
                                    </label>
                                </div>
                            </div>

                            {/* Content based on media type */}
                            {mediaType === 'text' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Explanation Text <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        rows="3"
                                        placeholder="Write an explanation that will appear when students click this word..."
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {(mediaType === 'image' || mediaType === 'video' || mediaType === 'audio') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {mediaType === 'image' ? '📷 Upload Image' : mediaType === 'video' ? '🎬 Upload Video' : '🎵 Upload Audio'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="media-file-input"
                                        type="file"
                                        accept={mediaType === 'image' ? 'image/*' : mediaType === 'video' ? 'video/*' : 'audio/*'}
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border rounded bg-white"
                                    />
                                    {mediaUrl && mediaType === 'image' && (
                                        <div className="mt-2">
                                            <p className="text-xs text-green-600 mb-1">✓ File selected: {mediaFileName}</p>
                                            <img src={mediaUrl} alt="Preview" className="max-h-32 rounded shadow" />
                                        </div>
                                    )}
                                    {mediaUrl && mediaType === 'video' && (
                                        <div className="mt-2">
                                            <p className="text-xs text-green-600 mb-1">✓ File selected: {mediaFileName}</p>
                                            <video src={mediaUrl} controls className="max-h-32 rounded shadow" />
                                        </div>
                                    )}
                                    {mediaUrl && mediaType === 'audio' && (
                                        <div className="mt-2">
                                            <p className="text-xs text-green-600 mb-1">✓ File selected: {mediaFileName}</p>
                                            <audio src={mediaUrl} controls className="w-full" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={addInteractiveWord}
                            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                        >
                            + Add Interactive Element
                        </button>
                    </div>

                    {/* Interactive Words List */}
                    {interactiveWords.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold mb-2">📋 Interactive Elements Added ({interactiveWords.length})</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {interactiveWords.map((item, idx) => (
                                    <div key={idx} className="bg-blue-50 p-3 rounded-lg flex justify-between items-start border border-blue-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{item.emoji}</span>
                                                <span className="font-bold text-gray-800 text-lg">"{item.word}"</span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-white">
                                                    {item.mediaType === 'text' && '📝 Text'}
                                                    {item.mediaType === 'image' && '🖼️ Image'}
                                                    {item.mediaType === 'video' && '🎬 Video'}
                                                    {item.mediaType === 'audio' && '🎵 Audio'}
                                                </span>
                                            </div>
                                            {item.mediaType === 'text' && (
                                                <p className="text-sm text-gray-600 mt-1">{item.explanation.substring(0, 100)}...</p>
                                            )}
                                            {item.mediaFileName && (
                                                <p className="text-xs text-gray-500 mt-1">📎 {item.mediaFileName}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeInteractiveWord(idx)}
                                            className="text-red-500 hover:text-red-700 ml-2 text-xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Preview */}
                    {articleText && interactiveWords.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-bold mb-2">👁️ Live Preview (How students will see it)</h3>
                            <div className="prose max-w-none p-4 bg-white rounded-lg border">
                                <div className="leading-relaxed">
                                    {getPreviewText().split(/(\s+)/).map((segment, idx) => {
                                        const isInteractive = interactiveWords.some(item => 
                                            segment.toLowerCase().includes(item.word.toLowerCase())
                                        );
                                        if (isInteractive) {
                                            const word = interactiveWords.find(item => 
                                                segment.toLowerCase().includes(item.word.toLowerCase())
                                            );
                                            return (
                                                <span key={idx} className="inline-flex items-center gap-1 bg-yellow-100 rounded-lg px-2 py-1 mx-0.5 cursor-pointer">
                                                    <span>{word?.emoji}</span>
                                                    <span className="font-medium">{segment}</span>
                                                </span>
                                            );
                                        }
                                        return <span key={idx}>{segment}</span>;
                                    })}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Students will click on highlighted words to see {interactiveWords.filter(w => w.mediaType !== 'text').length} images/videos/audio and {interactiveWords.filter(w => w.mediaType === 'text').length} text explanations!
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={insertInteractiveText}
                            disabled={!articleText.trim() || interactiveWords.length === 0}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                        >
                            {!articleText.trim() ? '✏️ Enter Article Text First' : 
                             interactiveWords.length === 0 ? '➕ Add Interactive Words First' : 
                             '📰 Add Interactive Article to Content'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveArticleEditor;