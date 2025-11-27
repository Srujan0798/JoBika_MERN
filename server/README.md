# JoBika Node.js Backend - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account (for email notifications)

## Installation

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret key for JWT
- `EMAIL_USER` and `EMAIL_PASSWORD` - Gmail credentials
- OAuth credentials (optional)

3. **Start MongoDB (if running locally):**
```bash
mongod
```

4. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### Resume
- `POST /api/resume/upload` - Upload resume (PDF/DOCX)
- `GET /api/resume` - Get user resumes
- `POST /api/resume/customize` - Customize resume for job
- `POST /api/resume/skill-gap` - Analyze skill gap
- `GET /api/resume/versions` - Get all resume versions

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs/scrape` - Scrape new jobs
- `POST /api/jobs` - Create job manually

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get single application
- `PATCH /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics
- `GET /api/analytics` - Get stats and insights
- `GET /api/analytics/learning-recommendations` - Get learning recommendations

### System
- `GET /api/health` - Health check
- `POST /api/auto-apply/trigger` - Manually trigger auto-apply

## Testing

```bash
# Test server is running
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'
```

## Cron Jobs

- **Auto-Apply**: Runs daily at 9 AM
  - Finds matching jobs for users with auto-apply enabled
  - Applies automatically based on preferences
  - Sends email confirmations

## Notes

- Default port: `5000`
- MongoDB required before starting
- Email features require Gmail SMTP configuration
- OAuth requires Google/LinkedIn app credentials
- Puppeteer failed to install - job scraper uses mock data (can be updated later)

## Next Steps

1. Connect frontend to this backend
2. Test all endpoints
3. Configure OAuth if needed
4. Deploy to production
