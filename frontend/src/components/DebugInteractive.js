import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const DebugInteractive = ({ token, user }) => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
        try {
const response = await api.get(`/api/content/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('FULL RESPONSE:', response.data);
            setContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;

    const interactiveArticles = content?.elements?.filter(el => el.type === 'interactive_text') || [];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">🔍 Debug Interactive Content</h1>
                
                {/* Content Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded">
                    <h2 className="font-bold mb-2">Content Information:</h2>
                    <p><strong>ID:</strong> {content?._id}</p>
                    <p><strong>Title:</strong> {content?.title}</p>
                    <p><strong>Content Type:</strong> {content?.contentType || 'standard'}</p>
                    <p><strong>Total Elements:</strong> {content?.elements?.length || 0}</p>
                    <p><strong>Interactive Articles Found:</strong> {interactiveArticles.length}</p>
                </div>

                {/* Interactive Articles */}
                {interactiveArticles.length === 0 ? (
                    <div className="mb-6 p-4 bg-red-50 rounded text-red-700">
                        ⚠️ NO INTERACTIVE ARTICLES FOUND IN THIS CONTENT!
                        <p className="text-sm mt-2">This means the data wasn't saved correctly during upload.</p>
                        <p className="text-sm mt-2">Please delete this content and create a new interactive article.</p>
                    </div>
                ) : (
                    interactiveArticles.map((article, idx) => (
                        <div key={idx} className="mb-6 p-4 bg-green-50 rounded">
                            <h2 className="font-bold text-lg mb-2">✅ Interactive Article {idx + 1}</h2>
                            <p><strong>Article Text:</strong> {article.content?.substring(0, 200)}</p>
                            <p><strong>Interactive Items Count:</strong> {article.interactiveElements?.length || 0}</p>
                            
                            {article.interactiveElements?.map((item, itemIdx) => (
                                <div key={itemIdx} className="ml-4 mt-3 p-3 bg-white rounded border">
                                    <p><strong>Item {itemIdx + 1}:</strong></p>
                                    <p>📝 Word: <span className="font-bold">{item.word}</span></p>
                                    <p>😊 Emoji: {item.emoji}</p>
                                    <p>📋 Media Type: <span className={`font-bold ${item.mediaType ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.mediaType || 'NOT SET!'}
                                    </span></p>
                                    <p>📖 Explanation: {item.explanation || '(empty)'}</p>
                                    <p>🔗 Media URL: {item.mediaUrl ? '✅ Has URL' : '❌ NO URL'}</p>
                                    {item.mediaUrl && <p className="text-xs text-gray-500 break-all">URL: {item.mediaUrl}</p>}
                                    <p>📎 File Name: {item.mediaFileName || '(none)'}</p>
                                </div>
                            ))}
                        </div>
                    ))
                )}

                {/* Raw Data */}
                <div className="mt-6">
                    <details>
                        <summary className="cursor-pointer font-bold p-2 bg-gray-100 rounded">View Raw JSON Data</summary>
                        <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded overflow-auto text-xs max-h-96">
                            {JSON.stringify(content, null, 2)}
                        </pre>
                    </details>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugInteractive;