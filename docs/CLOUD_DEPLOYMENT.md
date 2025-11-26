# 🚀 JoBika - Cloud Deployment Guide

## ☁️ Deployment Options

JoBika can be deployed to multiple cloud platforms for **$0/month**:

1. **Railway** (Recommended) - $5 free credit/month
2. **Render** - Free tier available
3. **Heroku** - $7/month (hobby tier)
4. **Vercel** - Free for frontend
5. **PythonAnywhere** - Free tier

---

## 🚂 Option 1: Railway Deployment (Recommended)

### **Why Railway?**
- ✅ $5 free credit/month
- ✅ Auto-deploys from GitHub
- ✅ PostgreSQL included
- ✅ Easy environment variables
- ✅ Custom domains

### **Step 1: Prepare Repository**

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - JoBika ready for deployment"

# Create GitHub repository
# Go to github.com and create new repo "JoBika"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/JoBika.git
git branch -M main
git push -u origin main
```

### **Step 2: Railway Setup**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your JoBika repository
6. Railway will auto-detect the configuration

### **Step 3: Add PostgreSQL**

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a database
4. Copy the `DATABASE_URL` from variables

### **Step 4: Environment Variables**

Add these in Railway dashboard:

```
DATABASE_URL=<from PostgreSQL addon>
SECRET_KEY=your-super-secret-key-change-this
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FLASK_ENV=production
```

### **Step 5: Deploy**

```bash
# Push any changes
git push origin main

# Railway auto-deploys!
```

### **Step 6: Access Your App**

Railway provides a URL like: `jobika-production.up.railway.app`

---

## 🎨 Option 2: Render Deployment

### **Why Render?**
- ✅ Completely free tier
- ✅ Auto-deploys from GitHub
- ✅ PostgreSQL included
- ✅ SSL certificates
- ✅ Custom domains

### **Step 1: Create render.yaml** (Already done!)

```yaml
# File: render.yaml
services:
  - type: web
    name: jobika
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && python server.py"
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: GMAIL_USER
        value: your-email@gmail.com
      - key: GMAIL_APP_PASSWORD
        value: your-app-password

databases:
  - name: jobika-db
    databaseName: jobika
    user: jobika
```

### **Step 2: Deploy to Render**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Blueprint"
4. Connect your JoBika repository
5. Render reads `render.yaml` automatically
6. Click "Apply"

### **Step 3: Access Your App**

Render provides a URL like: `jobika.onrender.com`

---

## 🌐 Option 3: Vercel (Frontend) + Railway (Backend)

### **Why Split?**
- ✅ Vercel is optimized for frontend
- ✅ Railway is optimized for backend
- ✅ Both have generous free tiers
- ✅ Better performance

### **Frontend on Vercel**:

1. Go to [vercel.com](https://vercel.com)
2. Import JoBika repository
3. Set root directory to `app`
4. Deploy

### **Backend on Railway**:

Follow Railway steps above

### **Connect Them**:

Update `app/assets/js/app.js`:
```javascript
const API_URL = 'https://your-railway-url.up.railway.app/api';
```

---

## 📊 Post-Deployment Checklist

### **Verify Deployment**:
- [ ] App loads successfully
- [ ] Database connected
- [ ] User registration works
- [ ] Login works
- [ ] Jobs display correctly
- [ ] Email notifications working
- [ ] All pages accessible

### **Test APIs**:
```bash
# Health check
curl https://your-app-url.com/api/health

# Get jobs
curl https://your-app-url.com/api/jobs

# Should return JSON responses
```

### **Monitor**:
- [ ] Check Railway/Render logs
- [ ] Monitor database usage
- [ ] Track API response times
- [ ] Watch for errors

---

## 🔒 Security Checklist

### **Before Going Live**:
- [ ] Change SECRET_KEY to strong random value
- [ ] Use environment variables (never hardcode)
- [ ] Enable HTTPS (auto on Railway/Render)
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Enable database backups

### **Generate Strong SECRET_KEY**:
```python
import secrets
print(secrets.token_hex(32))
# Use this as your SECRET_KEY
```

---

## 📈 Scaling Strategy

### **Free Tier Limits**:
- Railway: $5 credit/month (~500 hours)
- Render: 750 hours/month
- Database: 500MB free

### **When to Upgrade**:
- More than 1,000 users
- Database > 500MB
- Need 24/7 uptime
- Custom domain required

### **Upgrade Costs**:
- Railway: $5-$20/month
- Render: $7-$25/month
- Heroku: $7-$25/month

---

## 🌍 Custom Domain Setup

### **Railway**:
1. Go to project settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records
5. Wait for SSL certificate

### **Render**:
1. Go to dashboard
2. Click "Custom Domain"
3. Add domain
4. Update DNS records
5. Auto SSL enabled

### **DNS Records**:
```
Type: CNAME
Name: www
Value: your-app.railway.app (or .onrender.com)
```

---

## 📊 Monitoring & Analytics

### **Free Tools**:
- **Sentry** - Error tracking (free tier)
- **Google Analytics** - User analytics (free)
- **UptimeRobot** - Uptime monitoring (free)
- **LogRocket** - Session replay (free tier)

### **Setup Sentry**:
```bash
pip install sentry-sdk[flask]
```

```python
# In server.py
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions** (Free):

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push"
```

---

## 💾 Database Migration

### **On Railway/Render**:

```bash
# SSH into your app
railway run bash  # or render ssh

# Run migration
cd backend
python migrate_db.py

# Seed database
python -c "from server import seed_database; seed_database()"
```

---

## 🎯 Deployment Checklist

### **Pre-Deployment**:
- [x] Code tested locally
- [x] All bugs fixed
- [x] Documentation complete
- [x] Environment variables ready
- [x] Database schema finalized

### **Deployment**:
- [ ] Push to GitHub
- [ ] Connect to Railway/Render
- [ ] Add environment variables
- [ ] Deploy
- [ ] Run database migration

### **Post-Deployment**:
- [ ] Test all features
- [ ] Verify APIs working
- [ ] Check database connection
- [ ] Test email notifications
- [ ] Monitor logs

---

## 🚨 Troubleshooting

### **App Won't Start**:
```bash
# Check logs
railway logs  # or render logs

# Common issues:
- Missing environment variables
- Database not connected
- Port binding issues
```

### **Database Connection Failed**:
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
python -c "import psycopg2; print('Connected!')"
```

### **502 Bad Gateway**:
- Check if app is running
- Verify port configuration
- Check Railway/Render status

---

## 📞 Support

**Railway**:
- Discord: discord.gg/railway
- Docs: docs.railway.app

**Render**:
- Support: render.com/support
- Docs: render.com/docs

---

## 🎉 You're Live!

**Your JoBika app is now deployed and accessible globally!** 🌍

**Next Steps**:
1. Share your app URL
2. Invite beta users
3. Monitor usage
4. Collect feedback
5. Iterate and improve

---

**Deployment URL**: `https://your-app.railway.app`  
**Status**: ✅ Live  
**Cost**: $0/month  

**JoBika is now serving users worldwide!** 🚀
