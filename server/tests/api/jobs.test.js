const request = require('supertest');
const app = require('../index');
const Job = require('../models/Job');

describe('Jobs API Endpoints', () => {
    let authToken;

    beforeEach(async () => {
        // Register and login to get auth token
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
            });

        authToken = registerRes.body.token;

        // Create sample jobs
        await Job.create([
            {
                title: 'Software Engineer',
                company: 'Google',
                location: 'Remote',
                salary: '$120k-$180k',
                description: 'Build amazing products',
                requiredSkills: ['JavaScript', 'React', 'Node.js'],
                source: 'linkedin',
                url: 'https://example.com/job1',
            },
            {
                title: 'Full Stack Developer',
                company: 'Microsoft',
                location: 'Seattle',
                salary: '$130k-$200k',
                description: 'Work on Azure services',
                requiredSkills: ['Python', 'Azure', 'SQL'],
                source: 'indeed',
                url: 'https://example.com/job2',
            },
        ]);
    });

    describe('GET /api/jobs', () => {
        it('should get all jobs', async () => {
            const res = await request(app).get('/api/jobs');

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it('should filter jobs by location', async () => {
            const res = await request(app)
                .get('/api/jobs')
                .query({ location: 'Remote' });

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].location).toBe('Remote');
        });

        it('should filter jobs by source', async () => {
            const res = await request(app)
                .get('/api/jobs')
                .query({ source: 'linkedin' });

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].source).toBe('linkedin');
        });

        it('should search jobs by title', async () => {
            const res = await request(app)
                .get('/api/jobs')
                .query({ search: 'Software' });

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].title).toContain('Software');
        });
    });

    describe('GET /api/jobs/:id', () => {
        it('should get a single job by id', async () => {
            const jobs = await Job.find();
            const jobId = jobs[0]._id;

            const res = await request(app).get(`/api/jobs/${jobId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Software Engineer');
            expect(res.body.company).toBe('Google');
        });

        it('should return 404 for non-existent job', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/api/jobs/${fakeId}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/jobs/scrape', () => {
        it('should scrape new jobs', async () => {
            const res = await request(app)
                .post('/api/jobs/scrape')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query: 'software engineer',
                    location: 'remote',
                    limit: 5,
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('scraped');
            expect(res.body).toHaveProperty('added');
            expect(res.body.scraped).toBeGreaterThan(0);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/jobs/scrape')
                .send({
                    query: 'software engineer',
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
