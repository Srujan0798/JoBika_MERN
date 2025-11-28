# JoBika - Job Application Automation Platform

A full-stack PERN application for automated job applications with resume management, job scraping, and skill gap analysis.

## Quick Start

```bash
# Install dependencies
cd server && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run locally
npm run dev

# Run tests
npm test
```

## Project Structure

```
JoBika_PERN/
├── app/                    # Frontend (React/HTML)
├── server/                 # Backend (Node.js + Express + PostgreSQL)
├── mobile/                 # React Native app (future)
├── docs/                   # Documentation
│   ├── deployment/        # Deployment guides
│   └── archive/           # Legacy docs
├── abcxyz/                # Session logs (for context restoration)
├── scripts/               # Utility scripts (verify, deploy)
└── README.md              # This file
```

## Features

- 📄 **Resume Management**: Upload, edit, and version control
- 🔍 **Job Scraping**: LinkedIn, Indeed, Glassdoor, ZipRecruiter
- 🤖 **Auto-Apply**: Automated job applications
- 📊 **Skill Gap Analysis**: AI-powered recommendations
- 📱 **Application Tracking**: Monitor all applications
- 🔔 **Notifications**: Real-time updates

## Tech Stack

- **Frontend**: React, HTML5, CSS3
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **ORM**: Sequelize
- **Testing**: Jest, Supertest
- **Deployment**: Render (Backend), Vercel (Frontend planned)

## Deployment

See `docs/deployment/` for detailed guides:
- `VERCEL_DEPLOY.md` - Frontend deployment
- `MANUAL_DEPLOY_STEPS.md` - Backend deployment
- `ACTION_REQUIRED.md` - Critical setup steps

## Development

```bash
# Run tests
npm test

# Check database connection
node scripts/verify_final.js

# Full feature verification
node scripts/verify_features.js
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5001
```

## Current Status

✅ PERN migration complete
✅ All tests passing (14/14)
✅ Backend deployed to Render
⚠️ **Blocker**: Need Supabase IPv4 pooler URL (see `abcxyz/28112025.md`)

## Quick Context Restoration

New to this project? Read these in order:
1. `abcxyz/1@past.md` - Full history
2. `abcxyz/28112025.md` - Latest session

## License

MIT

---

**Live URLs**:
- Backend: https://jobika-pern.onrender.com
- Supabase: https://supabase.com/dashboard/project/gvybvfbnqgzcisuchocz
