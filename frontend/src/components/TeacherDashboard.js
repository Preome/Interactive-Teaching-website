import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContentUpload from './ContentUpload';
import ContentViewer from './ContentViewer';

const TeacherDashboard = ({ token, user }) => {
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/content/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContents(response.data);
        } catch (error) {
            console.error('Error fetching contents:', error);
        }
    };

    const subjects = ['microsoft_word', 'excel', 'powerpoint', 'internet', 'other'];

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user.name}</span>
                        <button onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-4 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`pb-2 px-4 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    >
                        Upload Content
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`pb-2 px-4 ${activeTab === 'manage' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    >
                        Manage Content
                    </button>
                </div>

                {activeTab === 'upload' && <ContentUpload token={token} onUploadSuccess={fetchContents} />}
                
                {activeTab === 'manage' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contents.map(content => (
                                <div key={content._id} className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-bold text-lg mb-2">{content.title}</h3>
                                    <p className="text-gray-600 mb-2">Subject: {content.subject}</p>
                                    <p className="text-gray-500 text-sm mb-4">{content.description}</p>
                                    <button
                                        onClick={() => setSelectedContent(content)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        View Content
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedContent && (
                <ContentViewer content={selectedContent} onClose={() => setSelectedContent(null)} isTeacher={true} />
            )}
        </div>
    );
};

export default TeacherDashboard;