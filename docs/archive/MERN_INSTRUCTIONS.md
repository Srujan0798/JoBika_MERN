# ⚛️ MERN Stack Setup Instructions

Since we couldn't run Node.js on the current machine, I have prepared the entire MERN codebase for you to run on your laptop.

## 1. Prerequisites
On your laptop, make sure you have:
- [ ] **Node.js** installed (Download from [nodejs.org](https://nodejs.org/))
- [ ] **MongoDB** installed (or use MongoDB Atlas cloud)

## 2. Quick Start (Windows)
1. Copy the entire `JoBika` folder to your laptop.
2. Double-click the **`setup_mern.bat`** script.
   - This will automatically install all dependencies for both Backend and Frontend.
   - It will also create the React frontend app for you.

## 3. Manual Setup (Mac/Linux)
If you are not on Windows, run these commands in the terminal:

### Backend Setup
```bash
cd server
npm install
```

### Frontend Setup
```bash
# Create React app if not exists
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 4. Running the App

### Start Backend (Terminal 1)
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 5. Environment Variables
Create a `.env` file in the `server/` folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobika
JWT_SECRET=your_secret_key
```

## 6. What's Included?
- **Backend**: Express.js server with Auth, Jobs, and Resume APIs.
- **Database**: Mongoose models for User, Job, and Resume.
- **Frontend**: A fresh React + Vite project (created by the script).

Happy Coding! 🚀
