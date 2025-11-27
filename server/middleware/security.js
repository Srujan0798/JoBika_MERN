/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to responses
 */

const helmet = require('helmet');

/**
 * Configure security headers
 */
const securityHeaders = () => {
    // Use helmet for common security headers
    // If helmet is not installed, use custom headers
    try {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        });
    } catch (error) {
        // Fallback if helmet not installed
        return (req, res, next) => {
            // Prevent clickjacking
            res.setHeader('X-Frame-Options', 'DENY');

            // Prevent MIME type sniffing
            res.setHeader('X-Content-Type-Options', 'nosniff');

            // Enable XSS protection
            res.setHeader('X-XSS-Protection', '1; mode=block');

            // Referrer policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

            // Permissions policy
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

            next();
        };
    }
};

/**
 * CORS security middleware
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5500'
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = { securityHeaders, corsOptions };
