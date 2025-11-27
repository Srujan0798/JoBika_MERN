# JoBika Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                        │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Express.js Server                             │
│                  http://localhost:5000                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                        │  │
│  │  • CORS         • Rate Limiting    • Error Handler        │  │
│  │  • JWT Auth     • Body Parser      • Request Logger       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Route Layer                            │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   Auth   │  │  Resume  │  │   Jobs   │  │   Apps   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐                                │  │
│  │  │  Notify  │  │Analytics │                                │  │
│  │  └──────────┘  └──────────┘                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                           │  │
│  │                                                             │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │  │
│  │  │ Resume Parser  │  │ Job Scraper    │  │ Auto-Apply  │  │  │
│  │  │ • PDF Parse    │  │ • LinkedIn     │  │ • Match     │  │  │
│  │  │ • Skill Extract│  │ • Indeed       │  │ • Apply     │  │  │
│  │  └────────────────┘  └────────────────┘  └─────────────┘  │  │
│  │                                                             │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │  │
│  │  │ Customizer     │  │ Skill Analyzer │  │ Email       │  │  │
│  │  │ • AI Enhance   │  │ • Gap Analysis │  │ • Nodemailer│  │  │
│  │  └────────────────┘  └────────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Model Layer (Mongoose)                  │  │
│  │                                                             │  │
│  │  User • Resume • Job • Application • Notification          │  │
│  │  ResumeVersion • SkillGap • UserPreference                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ├─ MongoDB Protocol
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      MongoDB Database                            │
│                   mongodb://localhost:27017                      │
│                                                                   │
│  Collections:                                                    │
│  • users          • resumes       • jobs                         │
│  • applications   • notifications • resumeversions               │
│  • skillgaps      • userpreferences                              │
└───────────────────────────────────────────────────────────────┘


External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Gmail SMTP   │  │ Google OAuth │  │LinkedIn OAuth│
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Request Flow

### 1. User Registration
```
Frontend → POST /api/auth/register
          ↓
       Auth Route
          ↓
    Validate Input
          ↓
    Hash Password (bcrypt)
          ↓
    Create User (Mongoose)
          ↓
    Generate JWT Token
          ↓
    Send Welcome Email (async)
          ↓
Create Notification (async)
          ↓
    Return Token + User
```

### 2. Resume Upload & Analysis
```
Frontend → POST /api/resume/upload (multipart/form-data)
          ↓
    Auth Middleware (verify JWT)
          ↓
       Multer (save file)
          ↓
   Resume Parser Service
          ↓
    ├─ Parse PDF/DOCX
    ├─ Extract Skills
    ├─ Extract Email/Phone
    ├─ Calculate Experience
    └─ Enhance Text
          ↓
    Create Resume Document
          ↓
Create Notification (async)
          ↓
 Return Parsed Resume Data
```

### 3. Job Application
```
Frontend → POST /api/applications
          ↓
    Auth Middleware
          ↓
    Validate Job Exists
          ↓
 Check Duplicate Application
          ↓
    Get User's Resume
          ↓
Calculate Match Score (service)
          ↓
  Create Application Document
          ↓
    ├─ Send Email (async)
    └─ Create Notification (async)
          ↓
   Return Application
```

### 4. Cron Job: Auto-Apply
```
Cron Schedule (9 AM daily)
          ↓
   Auto-Apply Service
          ↓
Get Users with auto-apply enabled
          ↓
  For each user:
    ├─ Get User Resume
    ├─ Find Matching Jobs (filters)
    ├─ Calculate Match Scores
    ├─ Apply to Top Jobs (up to daily limit)
    ├─ Create Applications
    └─ Send Confirmation Emails
```

---

## Data Models

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phone: String,
  oauthProvider: String,
  oauthId: String,
  twoFactorSecret: String,
  isTwoFactorEnabled: Boolean
}
```

### Resume
```javascript
{
  user: ObjectId → User,
  originalName: String,
  path: String,
  parsedContent: String,
  enhancedText: String,
  skills: [String],
  experienceYears: Number,
  extractedInfo: {
    name, email, phone
  }
}
```

### Job
```javascript
{
  title: String,
  company: String,
  location: String,
  description: String,
  salary: String,
  url: String,
  source: String,
  requiredSkills: [String],
  postedDate: String,
  matchScore: Number
}
```

### Application
```javascript
{
  user: ObjectId → User,
  job: ObjectId → Job,
  resume: ObjectId → Resume,
  status: String,
  matchScore: Number,
  appliedDate: Date,
  notes: String
}
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18
- **Database**: MongoDB v8
- **ODM**: Mongoose v8

### Authentication
- **JWT**: jsonwebtoken v9
- **Password Hashing**: bcryptjs v2.4
- **2FA**: speakeasy v2 + qrcode v1.5
- **OAuth**: passport + strategies

### File Processing
- **PDF**: pdf-parse v1.1
- **DOCX**: mammoth v1.6
- **Upload**: multer v1.4

### Services
- **Email**: nodemailer v6.9
- **NLP**: natural v6.10
- **Scraping**: cheerio v1 + puppeteer v21
- **Cron**: node-cron v3

### Testing
- **Framework**: Jest v29
- **HTTP Testing**: supertest v6
- **Mock DB**: mongodb-memory-server v9

### Security
- **CORS**: cors v2.8
- **Rate Limiting**: express-rate-limit v7

---

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - No plain text storage

2. **JWT Authentication**
   - Stateless tokens
   - 7-day expiration
   - Bearer token support

3. **Two-Factor Authentication**
   - TOTP-based (Google Authenticator compatible)
   - QR code generation
   - Backup codes

4. **Rate Limiting**
   - 100 requests/15min (general)
   - 5 requests/15min (auth)
   - 10 requests/hour (scraping)

5. **Input Validation**
   - Mongoose schema validation
   - File type restrictions
   - SQL injection prevention

6. **Error Handling**
   - No sensitive data in errors
   - Centralized error middleware
   - Proper HTTP status codes

---

## Scalability Considerations

### Current (Single Instance)
- Suitable for: <1000 users
- Performance: ~100 req/s
- Cost: Free tier (Railway/Render)

### Future Scaling Options

1. **Horizontal Scaling**
   - Load balancer
   - Multiple server instances
   - Session management (Redis)

2. **Database Optimization**
   - Indexes on frequent queries
   - Read replicas
   - Sharding for large datasets

3. **Caching**
   - Redis for session/tokens
   - Cache job listings
   - CDN for static files

4. **Async Processing**
   - Queue system (Bull/RabbitMQ)
   - Separate worker processes
   - Background job processing

---

## Monitoring & Logging

### Current
- Console logging
- Error tracking in logs

### Recommended Additions
- **APM**: New Relic / Datadog
- **Error Tracking**: Sentry
- **Uptime**: UptimeRobot
- **Analytics**: Google Analytics / Mixpanel

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│              Railway / Render                     │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │         JoBika Backend Container           │  │
│  │                                            │  │
│  │  • Node.js Runtime                         │  │
│  │  • Express Server                          │  │
│  │  • Cron Jobs                               │  │
│  │  • Environment Variables                   │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
└─────────────────┬────────────────────────────────┘
                  │
                  ├─ MongoDB Atlas (Cloud DB)
                  ├─ Gmail SMTP (Email)
                  └─ OAuth Providers
```

---

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Nodemon auto-restart
   ```

2. **Testing**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Watch mode
   npm run test:coverage # Coverage report
   ```

3. **Deployment**
   ```bash
   git push origin main  # Auto-deploy on Railway/Render
   ```

---

## API Design Principles

1. **RESTful Routes**
   - Resource-based URLs
   - HTTP verbs (GET, POST, PATCH, DELETE)
   - Plural nouns

2. **Consistent Response Format**
   ```javascript
   Success: { data, message }
   Error: { msg, error }
   ```

3. **Pagination Ready**
   - `.limit()` in queries
   - Ready for `?page=1&limit=10`

4. **Versioning Ready**
   - Currently `/api/`
   - Can add `/api/v1/` easily

---

## Future Enhancements

1. **WebSocket Support**
   - Real-time notifications
   - Live job updates

2. **GraphQL Layer**
   - Flexible queries
   - Reduce over-fetching

3. **Microservices**
   - Separate scraping service
   - Separate email service
   - API gateway

4. **ML Integration**
   - Better resume parsing
   - Smarter job matching
   - Salary prediction

