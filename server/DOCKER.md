# Docker Guide for JoBika Backend

## Quick Start with Docker

### Using Docker Compose (Recommended)

The easiest way to run JoBika backend with MongoDB:

```bash
# Start all services (backend + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

Access the API at: `http://localhost:5000`

---

## Manual Docker Commands

### Build Image
```bash
docker build -t jobika-backend:latest .
```

### Run Container

**With environment file:**
```bash
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name jobika-api \
  jobika-backend:latest
```

**With environment variables:**
```bash
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/jobika \
  -e JWT_SECRET=your-secret \
  --name jobika-api \
  jobika-backend:latest
```

### View Logs
```bash
docker logs -f jobika-api
```

### Execute Commands Inside Container
```bash
# Shell access
docker exec -it jobika-api sh

# Run tests
docker exec jobika-api npm test

# Run seeder
docker exec jobika-api npm run seed
```

### Stop and Remove
```bash
docker stop jobika-api
docker rm jobika-api
```

---

## Docker Compose Configuration

The `docker-compose.yml` includes:

### Services

1. **MongoDB** (Port 27017)
   - Image: mongo:6.0
   - Persistent data volume
   - Root credentials: admin/password123 (change in production)

2. **Backend** (Port 5000)
   - Built from Dockerfile
   - Connected to MongoDB
   - Auto-restart enabled
   - Uploads volume mounted

### Volumes
- `mongodb_data`: Persistent MongoDB storage
- `./uploads`: Resume uploads folder

### Networks
- `jobika-network`: Bridge network for service communication

---

## Environment Variables for Docker

Create `.env` file or set in docker-compose.yml:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/jobika?authSource=admin
JWT_SECRET=your-super-secret-key-change-this
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

---

## Production Deployment with Docker

### Build Production Image
```bash
docker build \
  --build-arg NODE_ENV=production \
  -t jobika-backend:1.0.0 \
  .
```

### Push to Registry
```bash
# Tag for Docker Hub
docker tag jobika-backend:1.0.0 yourusername/jobika-backend:1.0.0

# Push
docker push yourusername/jobika-backend:1.0.0
```

### Run in Production
```bash
docker run -d \
  -p 5000:5000 \
  --restart unless-stopped \
  --env-file .env.production \
  --name jobika-production \
  yourusername/jobika-backend:1.0.0
```

---

## Health Checks

The Dockerfile includes automatic health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', ...)"
```

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' jobika-api
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs jobika-api
```

**Common issues:**
- Missing environment variables
- MongoDB not accessible
- Port 5000 already in use

### Can't Connect to MongoDB

**From container, MongoDB should be accessible at:**
```
mongodb://mongodb:27017  # Using service name from docker-compose
```

**From host, MongoDB is at:**
```
mongodb://localhost:27017
```

### Uploads Not Persisting

Ensure uploads volume is mounted:
```yaml
volumes:
  - ./uploads:/app/uploads
```

### Out of Memory

Increase container memory:
```bash
docker run -d \
  --memory="512m" \
  -p 5000:5000 \
  jobika-backend:latest
```

---

## Development with Docker

### Hot Reload (Development)

Modify `docker-compose.yml` for development:

```yaml
backend:
  build:
    context: .
    dockerfile: Dockerfile
  command: npm run dev  # Use nodemon
  volumes:
    - .:/app  # Mount source code
    - /app/node_modules  # Don't override node_modules
  environment:
    NODE_ENV: development
```

### Running Tests in Container

```bash
# Run all tests
docker exec jobika-api npm test

# Run with coverage
docker exec jobika-api npm run test:coverage

# Run specific test file
docker exec jobika-api npm test tests/api/auth.test.js
```

---

## Multi-Stage Build (Optimization)

For smaller production images, use multi-stage build:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Docker Best Practices

1. **Use .dockerignore**
   ```
   node_modules
   npm-debug.log
   .env
   .git
   coverage
   ```

2. **Layer Caching**
   - Copy package.json first
   - Install dependencies
   - Then copy source code

3. **Security**
   - Don't run as root
   - Use alpine images
   - Scan for vulnerabilities: `docker scan jobika-backend`

4. **Size Optimization**
   - Use `npm ci --only=production`
   - Remove dev dependencies
   - Use multi-stage builds

---

## Kubernetes Deployment (Advanced)

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jobika-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jobika-backend
  template:
    metadata:
      labels:
        app: jobika-backend
    spec:
      containers:
      - name: backend
        image: yourusername/jobika-backend:1.0.0
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: jobika-secrets
              key: mongodb-uri
```

---

## CI/CD with Docker

GitHub Actions workflow (already included):

```yaml
- name: Build Docker image
  run: docker build -t jobika-backend:latest .

- name: Test Docker image
  run: |
    docker run -d -p 5000:5000 --name test jobika-backend:latest
    docker exec test npm test
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `docker ps` | List running containers |
| `docker exec -it jobika-api sh` | Shell access |
| `docker system prune -a` | Clean up unused images/containers |

