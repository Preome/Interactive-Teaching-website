import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const Signup = ({ setToken, setUser }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('`${API_URL}/api/auth/signup', {
                name, email, password, role
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setToken(response.data.token);
            setUser(response.data.user);
            
            if (role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
            </div>

            <div className="max-w-6xl w-full mx-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Banner */}
                    <div className="hidden md:block text-white space-y-6 animate-fadeInLeft">
                        <div className="relative">
                            <div className="text-7xl mb-4 animate-bounce">🎓</div>
                            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                                Gyantori
                            </h1>
                            <p className="text-2xl font-semibold text-white mb-2">
                                Join Our Learning Community
                            </p>
                            <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mb-6"></div>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Create your account and start your journey towards interactive and engaging learning.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Signup Form */}
                    <div className="animate-fadeInRight">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                            <div className="md:hidden text-center mb-6">
                                <div className="text-5xl mb-2">🎓</div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                                    Gyantori
                                </h1>
                            </div>

                            <h2 className="text-3xl font-bold text-center mb-2 text-white">Create Account</h2>
                            <p className="text-center text-gray-300 mb-8">Start your learning journey today</p>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">I am a</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition">
                                            <input
                                                type="radio"
                                                value="student"
                                                checked={role === 'student'}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-4 h-4 text-yellow-400"
                                            />
                                            <span className="text-white">Student</span>
                                        </label>
                                        <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition">
                                            <input
                                                type="radio"
                                                value="teacher"
                                                checked={role === 'teacher'}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-4 h-4 text-yellow-400"
                                            />
                                            <span className="text-white">Teacher</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-pink-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 mt-6"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-300">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition">
                                        Login
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fadeInLeft {
                    animation: fadeInLeft 0.6s ease-out;
                }
                .animate-fadeInRight {
                    animation: fadeInRight 0.6s ease-out;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
                .delay-500 {
                    animation-delay: 0.5s;
                }
            `}</style>
        </div>
    );
};

export default Signup;