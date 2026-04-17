import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const Login = ({ setToken, setUser }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
const response = await api.post('/api/auth/login', {
                email, password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setToken(response.data.token);
            setUser(response.data.user);
            
            // Navigate based on user role
            if (response.data.user.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                    {/* Left Side - Banner / Info Section */}
                    <div className="hidden md:block text-white space-y-6 animate-fadeInLeft">
                        <div className="relative">
                            <div className="text-7xl mb-4 animate-bounce">🎓</div>
                            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                                Gyantori
                            </h1>
                            <p className="text-2xl font-semibold text-white mb-2">
                                An Interactive Teaching Platform
                            </p>
                            <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mb-6"></div>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Transform your learning experience with interactive lessons, 
                                real-time quizzes, and collaborative tools designed for modern education.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="animate-fadeInRight">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                            {/* Mobile Banner */}
                            <div className="md:hidden text-center mb-6">
                                <div className="text-5xl mb-2">🎓</div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                                    Gyantori
                                </h1>
                                <p className="text-gray-300">An Interactive Teaching Platform</p>
                            </div>

                            <h2 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back!</h2>
                            <p className="text-center text-gray-300 mb-8">Login to continue your learning journey</p>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-yellow-400" />
                                        <span className="ml-2 text-sm text-gray-300">Remember me</span>
                                    </label>
                                    <a href="#" className="text-sm text-yellow-400 hover:text-yellow-300 transition">
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-pink-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Logging in...</span>
                                        </div>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-300">
                                    Don't have an account?{' '}
                                    <a href="/signup" className="text-yellow-400 hover:text-yellow-300 font-semibold transition">
                                        Sign up
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Login;