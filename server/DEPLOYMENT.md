# JoBika Backend - Deployment Guide

## Overview

This guide covers deploying the JoBika Node.js backend to various platforms.

---

## Option 1: Railway (Recommended)

### Why Railway?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy MongoDB integration
- ✅ GitHub auto-deploy
- ✅ Environment variables UI

### Deployment Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your JoBika-MERN repository
   - Root directory: `/server`

3. **Add MongoDB**
   - Click "New" → "Database" → "MongoDB"
   - Railway will automatically create a database
   - Copy the `MONGODB_URI` from variables

4. **Configure Environment Variables**
   Click "Variables" and add:
   ```
   NODE_ENV=production
   MONGODB_URI=<from MongoDB service>
   JWT_SECRET=<generate random string>
   EMAIL_USER=<your gmail>
   EMAIL_PASSWORD=<your gmail app password>
   FRONTEND_URL=https://your-frontend.netlify.app
   ```

5. **Deploy**
   - Railway automatically deploys on git push
   - Click "Deploy" to redeploy manually
   - Get your URL from deployment logs

6. **Custom Domain** (Optional)
   - Settings → Domains → Add custom domain
   - Follow DNS configuration steps

---

## Option 2: Render

### Deployment Steps

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - Name: jobika-backend
     - Environment: Node
     - Build Command: `cd server && npm install`
     - Start Command: `cd server && npm start`

3. **Add MongoDB**
   - Use MongoDB Atlas (free tier)
   - Or add Render MongoDB add-on

4. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=<your mongodb atlas uri>
   JWT_SECRET=<random string>
   EMAIL_USER=<your gmail>
   EMAIL_PASSWORD=<gmail app password>
   FRONTEND_URL=<your frontend url>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on git push

---

## Option 3: Vercel (Serverless)

### Configuration

Create `vercel.json` in `/server`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Deploy
```bash
cd server
npm install -g vercel
vercel
```

---

## MongoDB Atlas Setup (For any platform)

### Create Free Cluster

1. **Sign Up**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free accoun

t

2. **Create Cluster**
   - Choose "Shared" (free tier)
   - Select region closest to your deployment
   - Cluster name: jobika
   - Create cluster

3. **Setup Database Access**
   - Database Access → Add New User
   - Username: jobika
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

4. **Setup Network Access**
   - Network Access → Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0`
   - (For production, restrict to your server IPs)

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `jobika`

---

## Pre-Deployment Checklist

### Code Preparation

- [ ] All environment variables are in .env.example
- [ ] No hardcoded credentials
- [ ] NODE_ENV checks for production
- [ ] CORS configured for frontend domain
- [ ] Error logging setup

### Configuration Files

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `render.yaml`:
```yaml
services:
  - type: web
    name: jobika-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASSWORD
        sync: false
```

---

## Post-Deployment Steps

### 1. Test Health Endpoint
```bash
curl https://your-app.railway.app/api/health
```

### 2. Test Registration
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

### 3. Test Database Connection
- Register a user
- Login
- Upload resume
- Create application

### 4. Monitor Logs
- Railway: View logs in dashboard
- Render: Logs tab
- Set up error monitoring (Sentry, LogRocket)

---

## Environment Variables Reference

Required for all deployments:
```bash
# Core
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobika

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend
FRONTEND_URL=https://your-frontend.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-secret
```

---

## Troubleshooting

### "Application Error" / 500 Error
- Check logs for specific error
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### MongoDB Connection Timeout
- Check network access settings in Atlas
- Verify connection string format
- Ensure IP whitelist includes 0.0.0.0/0

### cors Error in Production
- Update CORS in index.js:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

### Cron Job Not Running
- Some platforms don't support cron jobs
- Use external cron service (cron-job.org)
- Or use platform-specific scheduled jobs

---

## Scaling Considerations

### Free Tier Limits
- Railway: $5 credit/month (~500 hours)
- Render: 750 hours/month
- MongoDB Atlas: 512MB storage

### Upgrade Path
1. Start with free tiers
2. Monitor usage
3. Upgrade when:
   - Traffic exceeds limits
   - Need more storage
   - Need dedicated resources

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Railway
        run: npm install -g @railway/cli
        
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Monitoring & Maintenance

### Setup Uptime Monitoring
- Use UptimeRobot (free)
- Monitor: `https://your-app.com/api/health`
- Get alerts on downtime

### Setup Error Tracking
```bash
npm install @sentry/node
```

Update index.js:
```javascript
const Sentry = require("@sentry/node");

if (process.env.NODE_ENV === 'production') {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}
```

### Backup Database
- MongoDB Atlas: Automated backups included
- Manual backup:
```bash
mongodump --uri="your-connection-string"
```

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB user has minimal permissions
- [ ] Network access restricted (production)
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

---

## Next Steps After Deployment

1. Update frontend API_URL to production URL
2. Test all features end-to-end
3. Setup monitoring and alerts
4. Configure custom domain
5. Setup automated backups
6. Document deployment process

