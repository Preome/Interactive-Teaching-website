import React, { useState } from 'react';
import axios from 'axios';

const Signup = ({ setToken, setUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', {
                name, email, password, role
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setToken(response.data.token);
            setUser(response.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-96">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Sign Up</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Role</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mr-2"
                                />
                                Student
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="teacher"
                                    checked={role === 'teacher'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mr-2"
                                />
                                Teacher
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                        Sign Up
                    </button>
                </form>
                <p className="text-center mt-4 text-gray-600">
                    Already have an account? <a href="/login" className="text-green-600 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;