import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Protected route wrapper
    if (!token || !user) {
        // Check if we're on signup path
        if (window.location.pathname === '/signup') {
            return <Signup setToken={setToken} setUser={setUser} />;
        }
        return <Login setToken={setToken} setUser={setUser} />;
    }

    // Render appropriate dashboard based on role
    return (
        <div className="App">
            {user.role === 'teacher' ? (
                <TeacherDashboard token={token} user={user} />
            ) : (
                <StudentDashboard token={token} user={user} />
            )}
        </div>
    );
}

export default App;