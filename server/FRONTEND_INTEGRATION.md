# JoBika Backend - Frontend Integration Guide

## Overview

This guide will help you connect your existing JoBika frontend (`/app/` directory) to the new Node.js backend.

---

## Step 1: Update API Base URL

In your frontend JavaScript files, update the API base URL:

### Option A: Using a Config File (Recommended)

Create `app/assets/js/config.js`:
```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    // For production:
    // BASE_URL: 'https://your-backend.railway.app/api'
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
```

### Option B: Direct Update in Each File

Find and replace in all your frontend JS files:
```javascript
// Old Python backend (if any)
const API_URL = 'http://localhost:5000/api';

// New Node.js backend
const API_URL = 'http://localhost:5000/api';
```

---

## Step 2: Update Authentication

### Store JWT Token

After successful login/register:
```javascript
// Save token to localStorage
localStorage.setItem('token', response.token);

// Add to all subsequent requests
fetch(`${API_URL}/jobs`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
})
```

### Complete Auth Example

```javascript
// Registration
async function register(email, password, fullName) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName })
    });
    
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    }
    return data;
}

// Login
async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
        if (data.require2fa) {
            // Show 2FA input
            show2FAPrompt(email);
        } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        }
    }
    return data;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
}
```

---

## Step 3: Update API Endpoints

### Resume Upload

```javascript
async function uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // Don't set Content-Type for FormData
        },
        body: formData
    });
    
    return await response.json();
}
```

### Get Jobs with Filters

```javascript
async function getJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_URL}/jobs?${params}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    return await response.json();
}
```

### Apply to Job

```javascript
async function applyToJob(jobId, notes = '') {
    const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, notes })
    });
    
    return await response.json();
}
```

### Get Notifications

```javascript
async function getNotifications() {
    const response = await fetch(`${API_URL}/notifications`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    return await response.json();
}
```

### Customize Resume for Job

```javascript
async function customizeResume(jobId) {
    const response = await fetch(`${API_URL}/resume/customize`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
    });
    
    return await response.json();
}
```

### Get Skill Gap Analysis

```javascript
async function getSkillGap(jobId) {
    const response = await fetch(`${API_URL}/resume/skill-gap`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
    });
    
    return await response.json();
}
```

---

## Step 4: Error Handling

### Global Error Handler

```javascript
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            // Handle specific errors
            if (response.status === 401) {
                // Unauthorized - redirect to login
                logout();
                throw new Error('Session expired. Please login again.');
            }
            
            throw new Error(data.msg || data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showError(error.message);
        throw error;
    }
}

function showError(message) {
    // Show error notification to user
    alert(message); // Replace with your notification system
}
```

---

## Step 5: CORS Setup (if needed)

If you're running frontend on a different port (e.g., using live-server), CORS is already enabled in the backend. No changes needed!

Backend already includes:
```javascript
app.use(cors());
```

---

## Step 6: Testing the Integration

### Test Checklist

1. **Authentication Flow**
   - [ ] Register new user
   - [ ] Verify email notification
   - [ ] Login with credentials
   - [ ] Token stored in localStorage
   - [ ] Redirected to dashboard

2. **Resume Management**
   - [ ] Upload PDF resume
   - [ ] View parsed skills
   - [ ] Check extracted info (name, email, phone)

3. **Job Browsing**
   - [ ] View job listings
   - [ ] Filter by location
   - [ ] Search jobs
   - [ ] View job details

4. **Application Flow**
   - [ ] Apply to job
   - [ ] See match score
   - [ ] Check notifications
   - [ ] View application in tracker

5. **Advanced Features**
   - [ ] Customize resume for job
   - [ ] View skill gap analysis
   - [ ] Get learning recommendations
   - [ ] Check analytics

---

## Step 7: Example HTML Updates

### Update auth.html

Add this script at the bottom:
```html
<script>
const API_URL = 'http://localhost:5000/api';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed. Please try again.');
    }
});
</script>
```

---

## Step 8: Running Both Servers

### Terminal 1: Backend
```bash
cd server
npm run dev
```

### Terminal 2: Frontend
```bash
cd app
# Option 1: Python
python -m http.server 5500

# Option 2: Live Server (VS Code extension)
# Right-click index.html -> Open with Live Server

# Option 3: npx serve
npx serve -p 5500
```

Then open: `http://localhost:5500`

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Backend already has CORS enabled. Make sure backend is running on port 5000.

### Issue: 401 Unauthorized
**Solution**: Check if token is being sent:
```javascript
headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Issue: Network Error
**Solution**: 
- Verify backend is running (`npm run dev`)
- Check API_URL points to correct port
- Ensure MongoDB is connected

### Issue: Token Expired
**Solution**: Tokens expire after 7 days. Implement refresh or ask user to login again.

---

## Production Deployment

When deploying to production:

1. Update API_URL:
```javascript
const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api'
    : 'http://localhost:5000/api';
```

2. Deploy backend first (Railway/Render)
3. Update frontend API_URL
4. Deploy frontend (Netlify/Vercel)
5. Test end-to-end

---

## Need Help?

- Backend API docs: `http://localhost:5000/api/health`
- Check browser console for errors
- Check backend logs
- Review network tab in DevTools

