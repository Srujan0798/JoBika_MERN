# JoBika Backend - Troubleshooting Guide

Common issues and solutions when working with the JoBika backend.

---

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Database Connection](#database-connection)
3. [Authentication Problems](#authentication-problems)
4. [File Upload Issues](#file-upload-issues)
5. [Testing Issues](#testing-issues)
6. [Deployment Problems](#deployment-problems)
7. [Performance Issues](#performance-issues)

---

## Installation Issues

### npm install fails

**Problem**: `npm install` fails or hangs

**Solutions**:

1. **Clear npm cache**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use different registry**:
```bash
npm config set registry https://registry.npmjs.org/
npm install
```

3. **Skip Puppeteer** (if timing out):
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

4. **Update Node.js**:
```bash
# Check version
node --version

# Update to latest LTS
nvm install --lts
```

### Module not found errors

**Problem**: `Error: Cannot find module 'xyz'`

**Solution**:
```bash
npm install
# Or install specific package
npm install xyz
```

---

## Database Connection

### Cannot connect to MongoDB

**Problem**: `MongooseError: Could not connect to any servers`

**Solutions**:

1. **Check MongoDB is running** (local):
```bash
# Start MongoDB
mongod

# Check status
ps aux | grep mongod
```

2. **Check connection string**:
```bash
# .env should have:
MONGODB_URI=mongodb://localhost:27017/jobika

# Or for Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobika
```

3. **Check network access** (Atlas):
- Go to MongoDB Atlas → Network Access
- Add IP address: `0.0.0.0/0` (allow all)
- Or add your specific IP

4. **Check credentials** (Atlas):
- Verify username and password
- Ensure user has read/write permissions

### Database seeding fails

**Problem**: `seed.js` fails to populate database

**Solution**:
```bash
# Ensure MongoDB is running
mongod

# Run seeder
node scripts/seed.js

# Check logs for specific error
```

---

## Authentication Problems

### JWT token invalid

**Problem**: `Token is not valid` or `401 Unauthorized`

**Solutions**:

1. **Check token expiration**:
```javascript
// Tokens expire after 7 days
// Re-login to get new token
```

2. **Check JWT_SECRET**:
```bash
# Ensure .env has JWT_SECRET set
JWT_SECRET=your-secret-key-here
```

3. **Check Authorization header**:
```javascript
// Correct format:
headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
}

// NOT:
headers: {
    'x-auth-token': 'YOUR_TOKEN_HERE'
}
// (both work, but Bearer is preferred)
```

### 2FA issues

**Problem**: 2FA code not working

**Solutions**:

1. **Time sync issue**:
```bash
# Ensure system time is correct
# TOTP codes are time-based

# On Mac:
sudo sntp -sS time.apple.com

# Check time:
date
```

2. **QR code doesn't scan**:
```bash
# Use the manual code instead
# Backend returns both QR code and text code
```

### bcrypt errors

**Problem**: `Error: node-gyp rebuild failed`

**Solution**:
```bash
# On Mac:
xcode-select --install

# Then:
npm rebuild bcrypt --build-from-source

# Or use bcryptjs (pure JS):
npm uninstall bcrypt
npm install bcryptjs
```

---

## File Upload Issues

### Resume upload fails

**Problem**: File upload returns 400 or 500 error

**Solutions**:

1. **Check file size**:
```javascript
// Max size: 5MB (default)
// Check .env:
MAX_FILE_SIZE=5242880  // 5MB in bytes
```

2. **Check file type**:
```javascript
// Allowed: PDF, DOC, DOCX
// Update multer config in routes/resume.js if needed
```

3. **Check uploads directory**:
```bash
mkdir -p uploads
chmod 755 uploads
```

4. **PDF parsing fails**:
```bash
# Ensure pdf-parse is installed
npm install pdf-parse

# Test with different PDF
```

### Multer errors

**Problem**: `MulterError: Unexpected field`

**Solution**:
```javascript
// Ensure form field name matches:
// Backend expects: 'resume'
<input type="file" name="resume" />

// In curl:
curl -F "resume=@file.pdf" ...
```

---

## Testing Issues

### Tests fail to run

**Problem**: `jest: command not found`

**Solution**:
```bash
npm install --save-dev jest supertest mongodb-memory-server
```

### MongoDB Memory Server fails

**Problem**: Tests hang or timeout

**Solutions**:

1. **Increase timeout**:
```javascript
// In jest.config.js:
module.exports = {
    testTimeout: 30000, // 30 seconds
};
```

2. **Check available ports**:
```bash
# MongoDB Memory Server needs available ports
# Kill any hanging processes:
pkill -f mongod
```

3. **Clear cache**:
```bash
rm -rf node_modules/.cache
```

### Tests pass locally but fail in CI

**Problem**: Tests work on local machine but not on CI/CD

**Solutions**:

1. **Environment variables**:
```yaml
# Ensure CI has:
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/jobika-test
```

2. **MongoDB service in CI**:
```yaml
# GitHub Actions example:
services:
  mongodb:
    image: mongo:latest
    ports:
      - 27017:27017
```

---

## Deployment Problems

### Deployment fails on Railway/Render

**Problem**: Build succeeds but app crashes

**Solutions**:

1. **Check logs**:
```bash
# Railway: View logs in dashboard
# Render: Logs tab

# Common error: Missing environment variables
```

2. **Verify all env vars are set**:
```bash
# Required:
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

3. **Check start command**:
```json
// package.json:
"scripts": {
    "start": "node index.js"  // Must be "node" not "nodemon"
}
```

### CORS errors in production

**Problem**: Frontend can't access API

**Solutions**:

1. **Update CORS settings**:
```javascript
// index.js:
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

2. **Set FRONTEND_URL in .env**:
```bash
FRONTEND_URL=https://your-frontend.netlify.app
```

### MongoDB Atlas connection fails

**Problem**: Can't connect to Atlas in production

**Solutions**:

1. **IP Whitelist**:
- Atlas → Network Access
- Add `0.0.0.0/0` to allow all
- Or add Railway/Render IP addresses

2. **Connection string format**:
```bash
# Correct format:
mongodb+srv://username:password@cluster.mongodb.net/dbname

# Replace <password> with actual password
# Replace <dbname> with your database name
```

---

## Performance Issues

### API is slow

**Problem**: Requests take >1 second

**Solutions**:

1. **Add database indexes**:
```javascript
// Models already have indexes
// Verify they're created:
db.collection.getIndexes()
```

2. **Use pagination**:
```javascript
// In queries:
.limit(20)
.skip(page * 20)
```

3. **Enable caching** (future enhancement):
```javascript
// Add Redis for caching
npm install redis
```

### Memory leaks

**Problem**: Server runs out of memory

**Solutions**:

1. **Check for memory leaks**:
```bash
node --inspect index.js
# Use Chrome DevTools to profile
```

2. **Limit concurrent requests**:
```javascript
// Already implemented via rate limiting
// Increase server resources if needed
```

---

## Email Issues

### Emails not sending

**Problem**: `sendWelcomeEmail` fails silently

**Solutions**:

1. **Check Gmail settings**:
```bash
# Use App Password, not regular password
# Google Account → Security → 2-Step Verification → App Passwords
```

2. **Enable less secure apps** (if needed):
```bash
# Not recommended, use App Password instead
```

3. **Check .env**:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # 16-character app password
```

4. **Test email service**:
```javascript
// Create test script:
const { sendWelcomeEmail } = require('./services/emailService');
sendWelcomeEmail('test@example.com', 'Test User');
```

---

## OAuth Issues

### Google OAuth fails

**Problem**: Redirect URI mismatch

**Solution**:
```bash
# Ensure redirect URI in Google Cloud Console matches:
http://localhost:5000/api/auth/google/callback  # Local
https://your-domain.com/api/auth/google/callback  # Production
```

### LinkedIn OAuth fails

**Problem**: Invalid client credentials

**Solution**:
```bash
# Double-check credentials in .env:
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Ensure app is in development mode for testing
```

---

## Rate Limiting Issues

### Getting 429 errors

**Problem**: "Too many requests" error

**Solutions**:

1. **Wait for rate limit to reset**:
```bash
# Limits reset after time window:
# Auth: 15 minutes
# API: 15 minutes
# Scraping: 1 hour
```

2. **Adjust rate limits** (development):
```javascript
// middleware/rateLimit.js:
max: 1000,  // Increase for development
```

3. **Use different IP** (testing):
```bash
# Rate limits are per-IP
# Use VPN or different network
```

---

## Cron Job Issues

### Auto-apply not running

**Problem**: Cron job doesn't trigger

**Solutions**:

1. **Check cron schedule**:
```javascript
// index.js:
cron.schedule('0 9 * * *', ...)  // 9 AM daily
```

2. **Manual trigger for testing**:
```bash
curl -X POST http://localhost:5000/api/auto-apply/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

3. **Check logs**:
```bash
# Look for:
"🤖 Running auto-apply job..."
```

---

## Getting More Help

### Still having issues?

1. **Check documentation**:
- README.md
- ARCHITECTURE.md
- API_TESTING.md

2. **Enable debug logging**:
```bash
DEBUG=* npm run dev
```

3. **Check browser console** (frontend issues):
- Network tab for API calls
- Console for errors

4. **Create an issue**:
- GitHub Issues (if repository exists)
- Include error message and steps to reproduce

---

## Quick Diagnostics

Run these commands to diagnose issues:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# Check if server can start
npm start

# Run tests
npm test

# Check environment variables
cat .env

# Check logs
tail -f logs/error.log  # If logging to file
```

---

## Prevention Tips

1. **Always use .env for configuration**
2. **Keep dependencies updated**: `npm update`
3. **Run tests before deploying**: `npm test`
4. **Monitor logs** in production
5. **Use proper error handling**
6. **Validate input data**
7. **Keep backups** of database

