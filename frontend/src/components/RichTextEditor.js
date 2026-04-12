import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ initialContent, onSave }) => {
    const [content, setContent] = useState(initialContent || '');

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-96 mb-12"
            />
            <button
                onClick={() => onSave(content)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                Save Work
            </button>
        </div>
    );
};

export default RichTextEditor;