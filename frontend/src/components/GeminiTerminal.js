import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './GeminiTerminal.css'; // We'll create this

const GeminiTerminal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = location.state || {};
    const { contentId } = useParams();
    
    const [contentTitle, setContentTitle] = useState('Coding Practice');
    const [messages, setMessages] = useState([
        { role: 'system', content: '> Welcome to Gemini Coding Terminal! Type /help for commands\n> Context: ' + contentTitle }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (token && contentId) {
            axios.get(`http://localhost:5000/api/content/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setContentTitle(res.data.title);
                setMessages(prev => [{
                    role: 'system',
                    content: `> 🔗 Context loaded: ${res.data.title}\n> 📚 Subject: ${res.data.subject}\n> 💡 Ask coding questions or type /help`
                }]);
            }).catch(err => {
                console.error('Content load error:', err);
            });
        }
    }, [contentId, token]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        
        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: '> ' + userMessage }]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/student/gemini-practice', {
                contentId,
                contentTitle,
                prompt: userMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiResponse = response.data.response;
            setMessages(prev => [...prev, { role: 'ai', content: '> ' + aiResponse.replace(/\n/g, '\n> ') }]);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Connection failed';
            setMessages(prev => [...prev, { role: 'error', content: '> ❌ ' + errorMsg }]);
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

    const handleClose = () => {
        navigate('/student');
    };

    return (
        <div className="gemini-terminal fixed inset-0 bg-black flex flex-col z-[1000]">
            {/* Top Bar */}
            <div className="bg-gray-900 text-green-400 p-4 flex justify-between items-center border-b border-green-900">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">🤖 Gemini Coding Terminal</span>
                    <span className="text-xs bg-green-900 px-2 py-1 rounded">Context: {contentTitle}</span>
                </div>
                <button 
                    onClick={handleClose}
                    className="text-green-400 hover:text-white p-2 rounded transition-colors"
                    title="Close Terminal (Esc)"
                >
                    <span className="text-xl">×</span>
                </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-black text-green-400 font-mono text-sm leading-relaxed">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-1 ${msg.role === 'error' ? 'text-red-400' : ''}`}>
                        {msg.content.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                ))}
                {loading && (
                    <div className="animate-pulse">
                        <div>> Thinking...</div>
                        <div className="ml-4 h-4 bg-green-900 rounded w-20"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-gray-900 p-4 border-t border-green-900">
                <div className="flex items-center gap-2">
                    <span className="text-green-400 font-mono">user@terminal:~$</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your coding question... (Enter to send, /help for commands)"
                        className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-sm p-2"
                        autoFocus
                    />
                    {loading && <span className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></span>}
                </div>
                {error && (
                    <div className="text-red-400 text-xs mt-1 font-mono ml-8">
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeminiTerminal;

