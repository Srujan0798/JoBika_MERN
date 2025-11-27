# Quick Command Reference

## Development

```bash
# Start development server (auto-reload)
npm run dev
# or
./start-dev.sh

# Start production server
npm start
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Quick test runner
./run-tests.sh
```

## Database Management

```bash
# Populate with sample data
npm run seed

# Generate more jobs
npm run generate:jobs 50

# View database statistics
npm run db:stats

# Backup database
npm run backup

# List backups
npm run backup:list

# Restore from backup
npm run backup:restore backup-name
```

## Health & Monitoring

```bash
# Check server health
curl http://localhost:5000/api/health

# View API documentation
open http://localhost:5000/api-docs
```

## Quick Setup

```bash
# Automated setup
./setup.sh

# Manual setup
npm install
cp .env.example .env
# Edit .env file
npm run seed
npm run dev
```

## Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## Useful Endpoints

- `GET /api/health` - Health check
- `GET /api-docs` - Swagger documentation
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/jobs` - List jobs
- `GET /api/applications` - List applications

## Environment Variables

See `.env.example` for all variables.

Required:
- `MONGODB_URI`
- `JWT_SECRET`

Recommended:
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `NODE_ENV`

## Troubleshooting

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
mongosh mongodb://localhost:27017/jobika

# View server logs
npm run dev | tee server.log
```

For more help, see `TROUBLESHOOTING.md`
