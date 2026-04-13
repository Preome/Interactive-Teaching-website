import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axiosConfig';

const GeminiPractice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, user } = location.state || {};
    
    const { contentId } = useParams();
    
    const [contentTitle, setContentTitle] = useState('Programming Practice');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch content title
        const fetchTitle = async () => {
            try {
                const res = await api.get(``${API_URL}/api/content/${contentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContentTitle(res.data.title);
            } catch (err) {
                console.error('Error fetching title:', err);
            }
        };
        fetchTitle();
    }, [contentId, token]);

    const handlePractice = async () => {
        console.log('Generate clicked - prompt:', prompt.trim(), 'token:', token ? 'present' : 'missing');
        
        if (!prompt.trim()) {
            alert('Please enter a prompt first!');
            return;
        }
        
        setLoading(true);
        setError('');
        setResponse('');

        try {
            const res = await api.post('`${API_URL}/api/student/gemini-practice', {
                contentId,
                contentTitle,
                prompt: prompt.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Gemini response:', res.data);
            setResponse(res.data.response);
        } catch (err) {
            console.error('Gemini error:', err.response?.status, err.response?.data);
            setError(err.response?.data?.error || 'Practice session failed - check backend');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/student');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden max-w-2xl">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span>🤖</span>
                                Gemini Coding Practice
                            </h2>
                            <p className="opacity-90">{contentTitle}</p>
                        </div>
                        <button 
                            onClick={handleClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-2xl transition-all text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ask Gemini to help you practice:
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Examples:
• Explain this JavaScript function and give me 3 practice problems
• Create a Python exercise using this content about lists
• Generate HTML/CSS practice based on this lesson
• Debug this code for me and give follow-up questions"
                                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical min-h-[120px] text-sm"
                                rows="4"
                            />
                        </div>

                        <button
                            onClick={handlePractice}
                            disabled={!prompt.trim() || loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Generating practice...
                                </>
                            ) : (
                                '🚀 Generate Practice Exercises'
                            )}
                        </button>
                    </div>

                    {response && (
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                <span>✨</span>
                                Gemini's Practice Session
                            </h3>
                            <div 
                                className="prose prose-lg max-w-none leading-relaxed text-gray-800"
                                dangerouslySetInnerHTML={{ __html: response }}
                            />
                            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={handlePractice}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                                >
                                    🔄 New Exercise
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(response);
                                        alert('Copied to clipboard!');
                                    }}
                                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeminiPractice;

