# OAuth Setup Guide

## Overview

This guide will help you setup OAuth authentication with Google and LinkedIn for JoBika.

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it "JoBika" and click Create

### Step 2: Enable Google+ API

1. In the sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click Enable

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: JoBika
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: Web application
   - Name: JoBika Backend
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `https://your-domain.com/api/auth/google/callback` (for production)
   - Click Create

5. Copy the Client ID and Client Secret

### Step 4: Add to .env

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in details:
   - App name: JoBika
   - LinkedIn Page: Your page or create one
   - Privacy policy URL: Your privacy policy URL
   - App logo: Upload logo
   - Legal agreement: Check and agree

### Step 2: Configure OAuth Settings

1. Go to "Auth" tab
2. Add Redirect URLs:
   - `http://localhost:5000/api/auth/linkedin/callback`
   - `https://your-domain.com/api/auth/linkedin/callback` (for production)

3. Request access to:
   - r_liteprofile
   - r_emailaddress

4. Copy Client ID and Client Secret from "Auth" tab

### Step 3: Add to .env

```bash
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback
```

---

## Setup Passport Strategies

Create `server/config/passport.js`:

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const config = require('./config');

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { oauthId: profile.id, oauthProvider: 'google' },
                { email: profile.emails[0].value }
            ]
        });

        if (!user) {
            // Create new user
            user = await User.create({
                email: profile.emails[0].value,
                fullName: profile.displayName,
                oauthProvider: 'google',
                oauthId: profile.id,
            });
        } else if (!user.oauthId) {
            // Link OAuth to existing account
            user.oauthProvider = 'google';
            user.oauthId = profile.id;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: config.LINKEDIN_CLIENT_ID,
    clientSecret: config.LINKEDIN_CLIENT_SECRET,
    callbackURL: config.LINKEDIN_CALLBACK_URL,
    scope: ['r_emailaddress', 'r_liteprofile'],
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        
        let user = await User.findOne({ 
            $or: [
                { oauthId: profile.id, oauthProvider: 'linkedin' },
                { email: email }
            ]
        });

        if (!user) {
            user = await User.create({
                email: email,
                fullName: `${profile.name.givenName} ${profile.name.familyName}`,
                oauthProvider: 'linkedin',
                oauthId: profile.id,
            });
        } else if (!user.oauthId) {
            user.oauthProvider = 'linkedin';
            user.oauthId = profile.id;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
```

---

## Update Auth Routes

Update `server/routes/auth.js`:

```javascript
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Google OAuth
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/auth.html',
        session: false 
    }),
    (req, res) => {
        // Generate JWT
        const token = jwt.sign(
            { user: { id: req.user.id } },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token
        res.redirect(`http://localhost:5500/app/dashboard.html?token=${token}`);
    }
);

// LinkedIn OAuth
router.get('/linkedin',
    passport.authenticate('linkedin', { session: false })
);

router.get('/linkedin/callback',
    passport.authenticate('linkedin', { 
        failureRedirect: '/auth.html',
        session: false 
    }),
    (req, res) => {
        const token = jwt.sign(
            { user: { id: req.user.id } },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );
        
        res.redirect(`http://localhost:5500/app/dashboard.html?token=${token}`);
    }
);
```

---

## Update index.js

Add passport initialization:

```javascript
const passport = require('./config/passport');

// After app.use(express.json())
app.use(passport.initialize());
```

---

## Frontend Integration

Add OAuth buttons to `auth.html`:

```html
<div class="oauth-buttons">
    <a href="http://localhost:5000/api/auth/google" class="btn-google">
        <img src="google-icon.svg" alt="Google">
        Continue with Google
    </a>
    
    <a href="http://localhost:5000/api/auth/linkedin" class="btn-linkedin">
        <img src="linkedin-icon.svg" alt="LinkedIn">
        Continue with LinkedIn
    </a>
</div>
```

Handle OAuth redirect in dashboard.html:

```javascript
// Check for OAuth token in URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
    localStorage.setItem('token', token);
    // Remove token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Fetch user details
    fetchUserProfile();
}
```

---

## Testing OAuth

### Test Google OAuth

1. Start backend: `npm run dev`
2. Visit: `http://localhost:5000/api/auth/google`
3. Sign in with Google
4. Should redirect to dashboard with token

### Test LinkedIn OAuth

1. Visit: `http://localhost:5000/api/auth/linkedin`
2. Sign in with LinkedIn
3. Should redirect to dashboard with token

---

## Production Checklist

- [ ] Update redirect URLs in Google Cloud Console
- [ ] Update redirect URLs in LinkedIn App
- [ ] Add production URLs to .env
- [ ] Test OAuth flow in production
- [ ] Ensure HTTPS is enabled

---

## Troubleshooting

### "Redirect URI mismatch"
- Ensure callback URL in .env matches exactly what's in OAuth provider settings
- Include trailing slash if required

### "App not verified"
- For development, click "Advanced" → "Continue anyway"
- For production, submit app for verification

### "Scope not authorized"
- Ensure requested scopes are enabled in OAuth app settings
- Re-authorize app with new scopes

