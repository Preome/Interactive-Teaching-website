import React, { useState } from 'react';

const InteractiveArticleEditor = ({ onAddInteractiveText, onClose }) => {
    const [articleText, setArticleText] = useState('');
    const [interactiveWords, setInteractiveWords] = useState([]);
    const [selectedWord, setSelectedWord] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('📝');
    const [explanation, setExplanation] = useState('');

    const emojis = [
        '📝', '📖', '🔍', '💡', '⭐', '🎯', '📌', '🔔', '💎', '🌟',
        '📰', '🗞️', '📺', '🎬', '🎵', '🖼️', '📷', '🎨', '🔬', '🧪',
        '📊', '📈', '💰', '🏆', '🎉', '✨', '💪', '🤔', '😮', '👍'
    ];

    const addInteractiveWord = () => {
        if (selectedWord && explanation) {
            setInteractiveWords([
                ...interactiveWords,
                {
                    word: selectedWord,
                    emoji: selectedEmoji,
                    explanation: explanation,
                    position: articleText.indexOf(selectedWord)
                }
            ]);
            setSelectedWord('');
            setExplanation('');
        }
    };

    const insertInteractiveText = () => {
        if (!articleText.trim()) {
            alert('Please enter article text');
            return;
        }

        const interactiveElement = {
            type: 'interactive_text',
            content: articleText,
            interactiveElements: interactiveWords,
            order: 0
        };

        onAddInteractiveText(interactiveElement);
        onClose();
    };

    const highlightText = () => {
        let highlightedText = articleText;
        interactiveWords.forEach(item => {
            const regex = new RegExp(`(${item.word})`, 'gi');
            highlightedText = highlightedText.replace(regex, `${item.emoji} $1 ${item.emoji}`);
        });
        return highlightedText;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Create Interactive Article</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
                
                <div className="p-6">
                    {/* Article Text Input */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Article Text</label>
                        <textarea
                            value={articleText}
                            onChange={(e) => setArticleText(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="8"
                            placeholder="Enter your news article or educational content here. Select words to make them interactive..."
                        />
                    </div>

                    {/* Interactive Word Setup */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-bold mb-3">Add Interactive Elements to Words</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Select Word from Article</label>
                                <input
                                    type="text"
                                    value={selectedWord}
                                    onChange={(e) => setSelectedWord(e.target.value)}
                                    placeholder="Type a word from the article"
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Choose Emoji</label>
                                <div className="flex flex-wrap gap-2 border rounded p-2">
                                    {emojis.slice(0, 10).map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`text-2xl p-2 rounded ${selectedEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-600 mb-1">Explanation (appears when clicked)</label>
                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    rows="2"
                                    placeholder="Explain what this word means or provide additional information..."
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={addInteractiveWord}
                            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Add Interactive Element
                        </button>
                    </div>

                    {/* Interactive Words List */}
                    {interactiveWords.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold mb-2">Interactive Elements ({interactiveWords.length})</h3>
                            <div className="space-y-2">
                                {interactiveWords.map((item, idx) => (
                                    <div key={idx} className="bg-blue-50 p-3 rounded flex justify-between items-center">
                                        <div>
                                            <span className="text-2xl mr-2">{item.emoji}</span>
                                            <span className="font-bold">{item.word}</span>
                                            <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
                                        </div>
                                        <button
                                            onClick={() => setInteractiveWords(interactiveWords.filter((_, i) => i !== idx))}
                                            className="text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {articleText && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold mb-2">Preview</h3>
                            <div className="prose max-w-none">
                                {highlightText().split(/(\s+)/).map((segment, idx) => {
                                    const isInteractive = interactiveWords.some(w => 
                                        segment.toLowerCase().includes(w.word.toLowerCase())
                                    );
                                    if (isInteractive) {
                                        const word = interactiveWords.find(w => 
                                            segment.toLowerCase().includes(w.word.toLowerCase())
                                        );
                                        return (
                                            <span key={idx} className="inline-flex items-center gap-1 bg-yellow-100 rounded px-1 mx-0.5 cursor-pointer hover:bg-yellow-200">
                                                <span>{word?.emoji}</span>
                                                <span>{segment}</span>
                                                <span>{word?.emoji}</span>
                                            </span>
                                        );
                                    }
                                    return <span key={idx}>{segment}</span>;
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={insertInteractiveText}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add Interactive Article
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
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