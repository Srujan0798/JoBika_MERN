const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const config = require('./config/config');
const validateEnv = require('./config/validateEnv');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/logger');
const { securityHeaders, corsOptions } = require('./middleware/security');
const AutoApplySystem = require('./services/autoApply');
const UserPreference = require('./models/UserPreference');

const app = express();

// Validate environment variables on startup
validateEnv();

// Security middleware (apply first)
app.use(securityHeaders());

// CORS with security options
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', apiLimiter);

// Database Connection
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

// API Documentation (Swagger) - Optional, requires swagger-jsdoc and swagger-ui-express
try {
    const { specs, swaggerUi } = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'JoBika API Documentation'
    }));
    console.log('📚 Swagger documentation available at /api-docs');
} catch (error) {
    console.log('ℹ️  Swagger documentation not available (install swagger-jsdoc and swagger-ui-express)');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
    });
});

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// Serve frontend (if running in production)
if (config.NODE_ENV === 'production') {
    app.use(express.static('../app'));
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: '../app' });
    });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Auto-Apply Cron Job
// Runs every day at 9 AM
cron.schedule('0 9 * * *', async () => {
    console.log('🤖 Running auto-apply job...');
    try {
        const autoApplySystem = new AutoApplySystem();

        // Get users with auto-apply enabled
        const preferences = await UserPreference.find({ autoApplyEnabled: true });

        let totalApplications = 0;
        for (const pref of preferences) {
            try {
                const result = await autoApplySystem.processAutoApplyForUser(pref.user);
                if (result.success) {
                    totalApplications += result.applications;
                    console.log(`✅ Applied to ${result.applications} jobs for user ${pref.user}`);
                }
            } catch (error) {
                console.error(`❌ Auto-apply failed for user ${pref.user}:`, error.message);
            }
        }

        console.log(`✅ Auto-apply completed. Total applications: ${totalApplications}`);
    } catch (error) {
        console.error('❌ Auto-apply job failed:', error);
    }
});

// Manual trigger for auto-apply (for testing)
app.post('/api/auto-apply/trigger', async (req, res) => {
    try {
        const autoApplySystem = new AutoApplySystem();
        const userId = req.body.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ msg: 'User ID required' });
        }

        const result = await autoApplySystem.processAutoApplyForUser(userId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🚀 JoBika Server Started! 🚀      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`🗄️  Database: ${config.MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'}`);
    console.log('');
    console.log('✅ Features enabled:');
    console.log('   - Resume parsing (PDF/DOCX)');
    console.log('   - AI resume customization');
    console.log('   - Skill gap analysis');
    console.log('   - Job scraping (LinkedIn, Indeed, Naukri, Unstop)');
    console.log('   - Auto-apply system (cron: daily at 9 AM)');
    console.log('   - Email notifications');
    console.log('   - 2FA authentication');
    console.log('   - OAuth (Google, LinkedIn) - Configure in .env');
    console.log('');
    console.log(`📝 API Docs: http://localhost:${PORT}/api/health`);
    console.log('');
});

module.exports = app;
