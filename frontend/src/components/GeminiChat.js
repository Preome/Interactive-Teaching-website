import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const GeminiChat = ({ token, user }) => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Welcome to Coding Practice Chatbot! I\'m powered by Gemini AI. I can help you with:\n\n💡 Code debugging\n📝 Practice problems\n🤔 Algorithm explanations\n🎯 Project challenges\n\n**Sample prompts:**\n• "Give me 3 JavaScript array practice problems"\n• "Explain closure with example"\n• "Debug this loop code"\n• "Create a todo app challenge"\n\nWhat would you like to practice?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
const response = await api.post('/api/gemini-chat', {
                contentId,
                message: userMessage,
                subject: 'programming'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const botMessage = response.data.response;
            setMessages(prev => [...prev, { role: 'assistant', content: botMessage }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again or ask something else! 😅\n\nTry: "Give me a simple coding problem"' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const samplePrompts = [
        'Give me 3 JavaScript practice problems',
        'Explain loops with example',
        'Create a simple React challenge',
        'Debug this code: for(let i=0; i<10 i++)',
        'What is async/await?'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-green-400 font-mono">
            <header className="bg-black/50 backdrop-blur-md border-b border-green-500/30 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl animate-pulse">🤖</div>
                        <div>
                            <h1 className="text-xl font-bold">Gemini Coding Chatbot</h1>
                            <p className="text-sm opacity-75">Lesson: Programming</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/student')}
                            className="px-4 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-sm transition-all"
                        >
                            ← Back
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }} 
                            className="px-4 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-sm transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto h-screen flex flex-col pt-4 px-4 pb-20">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                    {messages.map((message, index) => (
                        <div key={index} className="flex">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                                message.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={`ml-4 flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block p-4 rounded-2xl max-w-3xl ${
                                    message.role === 'user' 
                                        ? 'bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-br-sm' 
                                        : 'bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-bl-sm'
                                } whitespace-pre-wrap leading-relaxed`}>
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-green-500/20 text-green-400">
                                🤖
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="inline-block p-4 rounded-2xl bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-bl-sm whitespace-pre-wrap leading-relaxed">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Sample Prompts */}
                <div className="bg-black/50 backdrop-blur-md border-t border-green-500/30 p-4 rounded-xl mt-4 mb-4">
                    <p className="text-sm opacity-75 mb-3">💡 Quick practice:</p>
                    <div className="flex flex-wrap gap-2">
                        {samplePrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => setInput(prompt)}
                                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-xs transition-all cursor-pointer hover:scale-105"
                            >
                                {prompt.substring(0, 30)}...
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="flex gap-3 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-green-500/30">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your coding question or practice request..."
                        className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-500/50 text-lg p-3 font-mono"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-600/50 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeminiChat;

