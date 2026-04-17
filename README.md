# 🚀 Gyantori: Interactive Teaching Platform

**Complete Learning Management System** with 20+ Interactive Features

## 🌐 Live Demo

**Frontend Login:** https://interactive-teaching-website-1.onrender.com/login

**🧑‍🏫 Teacher Login Credentials:**
```
teacher@gmail.com
password: 123
```

**👨‍🎓 Student Login Credentials:**
```
cat@gmail.com
password: 123
```

**Backend API:** https://interactive-teaching-website.onrender.com


## 🔥 **Key Features**

### 👩‍🏫 Teacher Features
- Upload interactive content (text, images, videos, audio) 
- Create interactive articles with clickable emojis
- Organize content by 20+ subjects
- Embed YouTube videos
- Cloudinary media storage integration
- Full CRUD operations on content
- Create quizzes (Multiple Choice, True/False, Fill in the Blanks)
- Set passing scores and time limits
- View student quiz results and performance

### 👨‍🎓 Student Features
- View multimedia lessons
- Interact with emoji-based content in articles
- Filter lessons by subject
- Search lessons easily
- Annotate lessons using rich text editor
- Save progress and continue later
- Take quizzes with instant scoring
- View quiz history and results

### 📚 Interactive Content
- **Multi-media Lessons** (Text, Images, Videos, Audio, YouTube)
- **📰 Interactive Articles** - Click emoji words → popup images/videos/audio
- **Real-time Content Viewer** with emoji buttons for each content type

### 🎯 Subject-Specific Tools
```
💻 Programming → VSCode-Style Coding Terminal + LIVE JS execution (Ctrl+Enter)
🗺️ Geography → Fullscreen Interactive Google Maps (Satellite/Street View)
🧮 Science/Math → Scientific Calculator
🔶 Quizzes → Create/Take MCQ with scoring
```

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm start
```

## 📦 Render Deployment Config
**Frontend (Static Site):**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `frontend/build`
- Env Var: `REACT_APP_API_URL=https://interactive-teaching-website.onrender.com/api`

**Backend (Node Server):** Standard Node/Express + MongoDB

## 🛠 Tech Stack
```
Frontend: React 18 + TailwindCSS + React Router v6
Backend: Node/Express + MongoDB + JWT + Multer + Cloudinary
AI: Google Gemini API
Maps: Leaflet + Google Maps
Editor: React Quill Rich Text
Media: YouTube + Cloudinary CDN
```

