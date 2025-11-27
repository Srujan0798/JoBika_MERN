# JoBika Testing Guide

## Running Tests

### Install Test Dependencies
```bash
cd server
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js                  # Test setup with MongoDB Memory Server
├── api/                      # API endpoint tests
│   ├── auth.test.js         # Auth routes (register, login)
│   └── jobs.test.js         # Jobs routes (CRUD, scraping)
├── models/                   # Model tests
│   └── user.test.js         # User model validation
└── services/                 # Service tests
    ├── resumeParser.test.js # Resume parsing functions
    └── skillAnalyzer.test.js # Skill gap analysis
```

## Test Coverage

### API Endpoints (20+ tests)
- ✅ User registration
- ✅ User login
- ✅ Job listing with filters
- ✅ Job scraping
- ✅ Authentication middleware
- ✅ Error handling

### Models (15+ tests)
- ✅ User creation and validation
- ✅ Password hashing
- ✅ OAuth support
- ✅ Duplicate email prevention

### Services (25+ tests)
- ✅ Email extraction
- ✅ Phone extraction
- ✅ Skill detection
- ✅ Experience calculation
- ✅ Match scoring
- ✅ Skill gap analysis
- ✅ Learning recommendations

## Manual Testing

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User"
  }'
```

### 4. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 5. Test Job Scraping
```bash
# Use the token from login response
curl -X POST http://localhost:5000/api/jobs/scrape \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "software engineer",
    "location": "remote",
    "limit": 10
  }'
```

## Frontend Integration Testing

### Update Frontend API URLs
In your frontend code, update the API base URL:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Test User Flow
1. Register new user
2. Login
3. Upload resume
4. Browse jobs
5. Apply to job
6. Check notifications
7. View analytics

## Notes

- Tests use MongoDB Memory Server (in-memory database)
- Each test runs in isolation
- Database is cleared after each test
- No need for  real MongoDB to run tests

## Troubleshooting

### Tests fail with "MongoDB Memory Server didn't start"
- Solution: Increase timeout in jest.config.js

### Import errors
- Solution: Ensure all dependencies are installed with `npm install`

### Port already in use
- Solution: Change PORT in .env or stop other instance

## Next Steps

- [ ] Add more API endpoint tests (resume, applications, notifications)
- [ ] Add integration tests
- [ ] Add E2E tests with frontend
- [ ] Setup CI/CD pipeline
