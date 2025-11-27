# Performance Optimization Guide

## Database Optimization

### Indexes
All critical queries have indexes defined in models:

```javascript
// User model
UserSchema.index({ email: 1 });

// Job model
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ location: 1 });
JobSchema.index({ source: 1 });
JobSchema.index({ createdAt: -1 });

// Application model
ApplicationSchema.index({ user: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ user: 1, status: 1 });
```

### Query Optimization

**Use projection** to limit returned fields:
```javascript
const users = await User.find({}, 'email fullName');
```

**Use lean()** for read-only queries:
```javascript
const jobs = await Job.find().lean();
```

**Limit results**:
```javascript
const jobs = await Job.find().limit(20).skip(page * 20);
```

---

## Caching Strategy

### Redis Integration (Optional)

Install Redis:
```bash
npm install redis
```

Setup Redis client:
```javascript
// config/redis.js
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Error:', err));

module.exports = client;
```

Cache jobs:
```javascript
const redis = require('./config/redis');

// Cache for 1 hour
async function getJobs() {
    const cached = await redis.get('jobs:latest');
    if (cached) return JSON.parse(cached);
    
    const jobs = await Job.find().limit(50);
    await redis.setEx('jobs:latest', 3600, JSON.stringify(jobs));
    return jobs;
}
```

---

## API Performance

### Compression

Enable gzip compression:
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### Response Time

Add response time header:
```bash
npm install response-time
```

```javascript
const responseTime = require('response-time');
app.use(responseTime());
```

---

## Load Testing

### Using Artillery

Install:
```bash
npm install -g artillery
```

Create `load-test.yml`:
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Get jobs'
    flow:
      - get:
          url: '/api/jobs'
```

Run:
```bash
artillery run load-test.yml
```

---

## Monitoring

### PM2 (Production)

Install:
```bash
npm install -g pm2
```

Start with PM2:
```bash
pm2 start index.js --name jobika-api
pm2 monit
pm2 logs jobika-api
```

### Health Monitoring

Set up uptime monitoring:
- UptimeRobot (free)
- Pingdom
- New Relic

Monitor `/api/health` endpoint every 5 minutes.

---

## Database Connection Pooling

Mongoose automatically handles connection pooling. Configure pool size:

```javascript
mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2
});
```

---

## Performance Metrics

### Key Metrics to Track

1. **Response Time**
   - Average: <200ms
   - 95th percentile: <500ms

2. **Throughput**
   - Target: 100 req/s per instance

3. **Error Rate**
   - Target: <1%

4. **Database Queries**
   - Average query time: <50ms

---

## Optimization Checklist

- [ ] Database indexes on frequent queries
- [ ] Redis caching for hot data
- [ ] Gzip compression enabled
- [ ] Query projection to limit fields
- [ ] Pagination on list endpoints
- [ ] Connection pooling configured
- [ ] Static assets served via CDN
- [ ] Image optimization
- [ ] Log aggregation (Splunk/ELK)
- [ ] APM tool integrated (New Relic)

