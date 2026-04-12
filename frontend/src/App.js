import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ContentViewPage from './components/ContentViewPage';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Protected Route wrapper component
    const ProtectedRoute = ({ children, allowedRoles }) => {
        // Check if user is authenticated
        if (!token || !user) {
            return <Navigate to="/login" replace />;
        }
        // Check if user has required role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            const redirectPath = user.role === 'teacher' ? '/teacher' : '/student';
            return <Navigate to={redirectPath} replace />;
        }
        return children;
    };

    // Public routes (no authentication needed)
    // Protected routes (authentication required)

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route 
                    path="/login" 
                    element={
                        !token ? (
                            <Login setToken={setToken} setUser={setUser} />
                        ) : (
                            <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />
                        )
                    } 
                />
                
                <Route 
                    path="/signup" 
                    element={
                        !token ? (
                            <Signup setToken={setToken} setUser={setUser} />
                        ) : (
                            <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />
                        )
                    } 
                />
                
                {/* Teacher Protected Routes */}
                <Route 
                    path="/teacher" 
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherDashboard token={token} user={user} />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Student Protected Routes */}
                <Route 
                    path="/student" 
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard token={token} user={user} />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Content View Page - Accessible by both teachers and students */}
                <Route 
                    path="/content/:contentId" 
                    element={
                        <ProtectedRoute allowedRoles={['student', 'teacher']}>
                            <ContentViewPage token={token} user={user} />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Default Route - Redirect based on authentication and role */}
                <Route 
                    path="/" 
                    element={
                        token ? (
                            user?.role === 'teacher' ? (
                                <Navigate to="/teacher" replace />
                            ) : (
                                <Navigate to="/student" replace />
                            )
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } 
                />
                
                {/* Catch all - redirect to home */}
                <Route 
                    path="*" 
                    element={
                        <Navigate to="/" replace />
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;