# JoBika API Testing Collection

Quick reference for testing all API endpoints using curl.

## Setup

```bash
# Base URL
API_URL="http://localhost:5000/api"

# After login, store your token
TOKEN="your-jwt-token-here"
```

---

## 1. Authentication

### Register
```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Setup 2FA
```bash
curl -X POST $API_URL/auth/2fa/setup \
  -H "Authorization: Bearer $TOKEN"
```

### Verify 2FA
```bash
curl -X POST $API_URL/auth/2fa/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

### Disable 2FA
```bash
curl -X POST $API_URL/auth/2fa/disable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123"
  }'
```

---

## 2. Resume Management

### Upload Resume
```bash
curl -X POST $API_URL/resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/path/to/your/resume.pdf"
```

### Get All Resumes
```bash
curl -X GET $API_URL/resume \
  -H "Authorization: Bearer $TOKEN"
```

### Customize Resume for Job
```bash
curl -X POST $API_URL/resume/customize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-id-here"
  }'
```

### Get Skill Gap Analysis
```bash
curl -X POST $API_URL/resume/skill-gap \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-id-here"
  }'
```

### Get Resume Versions
```bash
curl -X GET $API_URL/resume/versions \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Jobs

### Get All Jobs
```bash
curl -X GET $API_URL/jobs
```

### Get Jobs with Filters
```bash
# Filter by location
curl -X GET "$API_URL/jobs?location=Remote"

# Filter by source
curl -X GET "$API_URL/jobs?source=linkedin"

# Search jobs
curl -X GET "$API_URL/jobs?search=software+engineer"

# Combined filters
curl -X GET "$API_URL/jobs?location=Remote&source=linkedin&search=developer"
```

### Get Single Job
```bash
curl -X GET $API_URL/jobs/JOB_ID_HERE
```

### Scrape New Jobs
```bash
curl -X POST $API_URL/jobs/scrape \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "software engineer",
    "location": "remote",
    "limit": 20
  }'
```

### Create Job Manually
```bash
curl -X POST $API_URL/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "Remote",
    "description": "Great opportunity...",
    "salary": "$120k-$180k",
    "url": "https://example.com/job",
    "source": "manual",
    "requiredSkills": ["JavaScript", "React", "Node.js"]
  }'
```

---

## 4. Applications

### Apply to Job
```bash
curl -X POST $API_URL/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-id-here",
    "notes": "Very interested in this position"
  }'
```

### Get All Applications
```bash
curl -X GET $API_URL/applications \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Applications by Status
```bash
curl -X GET "$API_URL/applications?status=applied" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Application
```bash
curl -X GET $API_URL/applications/APPLICATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Update Application Status
```bash
curl -X PATCH $API_URL/applications/APPLICATION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interviewing",
    "notes": "First round interview scheduled"
  }'
```

### Delete Application
```bash
curl -X DELETE $API_URL/applications/APPLICATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Notifications

### Get All Notifications
```bash
curl -X GET $API_URL/notifications \
  -H "Authorization: Bearer $TOKEN"
```

### Get Unread Notifications Only
```bash
curl -X GET "$API_URL/notifications?isRead=false" \
  -H "Authorization: Bearer $TOKEN"
```

### Mark Notifications as Read
```bash
curl -X POST $API_URL/notifications/mark-read \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationIds": ["id1", "id2", "id3"]
  }'
```

### Mark All as Read
```bash
curl -X POST $API_URL/notifications/mark-all-read \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Notification
```bash
curl -X DELETE $API_URL/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Analytics

### Get Analytics Dashboard
```bash
curl -X GET $API_URL/analytics \
  -H "Authorization: Bearer $TOKEN"
```

### Get Learning Recommendations
```bash
curl -X GET $API_URL/analytics/learning-recommendations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. System

### Health Check
```bash
curl -X GET $API_URL/health
```

### Trigger Auto-Apply (Manual)
```bash
curl -X POST $API_URL/auto-apply/trigger \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'
```

---

## Complete Workflow Example

```bash
#!/bin/bash

API_URL="http://localhost:5000/api"

echo "1. Register user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123",
    "fullName": "Demo User"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo -e "\n2. Upload resume..."
curl -X POST $API_URL/resume/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@resume.pdf"

echo -e "\n3. Scrape jobs..."
curl -X POST $API_URL/jobs/scrape \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "software engineer",
    "location": "remote",
    "limit": 5
  }'

echo -e "\n4. Get jobs..."
JOBS=$(curl -s -X GET $API_URL/jobs)
echo $JOBS | head -c 200

echo -e "\n\nWorkflow complete!"
```

---

## Tips

### Pretty Print JSON
```bash
curl -X GET $API_URL/jobs | jq '.'
```

### Save Response to File
```bash
curl -X GET $API_URL/jobs > jobs.json
```

### Show Response Headers
```bash
curl -i -X GET $API_URL/health
```

### Verbose Mode
```bash
curl -v -X GET $API_URL/health
```
