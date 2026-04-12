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

    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!token || !user) {
            return <Navigate to="/login" replace />;
        }
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            const redirectPath = user.role === 'teacher' ? '/teacher' : '/student';
            return <Navigate to={redirectPath} replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    !token ? <Login setToken={setToken} setUser={setUser} /> : 
                    <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />
                } />
                
                <Route path="/signup" element={
                    !token ? <Signup setToken={setToken} setUser={setUser} /> : 
                    <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} replace />
                } />
                
                <Route path="/teacher" element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherDashboard token={token} user={user} />
                    </ProtectedRoute>
                } />
                
                <Route path="/student" element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard token={token} user={user} />
                    </ProtectedRoute>
                } />
                
                <Route path="/content/:contentId" element={
                    <ProtectedRoute allowedRoles={['student', 'teacher']}>
                        <ContentViewPage token={token} user={user} />
                    </ProtectedRoute>
                } />
                

                
                <Route path="/" element={
                    <Navigate to={token ? (user?.role === 'teacher' ? '/teacher' : '/student') : '/login'} replace />
                } />
            </Routes>
        </Router>
    );
}

export default App;

