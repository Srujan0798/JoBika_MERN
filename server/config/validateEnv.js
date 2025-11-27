/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before starting the server
 */

const required = [
    'MONGODB_URI',
    'JWT_SECRET',
];

const recommended = [
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'NODE_ENV',
    'PORT',
];

const optional = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'FRONTEND_URL',
];

function validateEnvironment() {
    const missing = [];
    const warnings = [];

    console.log('🔍 Validating environment variables...\n');

    // Check required variables
    required.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
        } else {
            console.log(`✅ ${varName}`);
        }
    });

    // Check recommended variables
    recommended.forEach(varName => {
        if (!process.env[varName]) {
            warnings.push(varName);
            console.log(`⚠️  ${varName} (recommended)`);
        } else {
            console.log(`✅ ${varName}`);
        }
    });

    // Check optional variables
    optional.forEach(varName => {
        if (process.env[varName]) {
            console.log(`✅ ${varName} (optional)`);
        }
    });

    console.log('');

    // Report missing required variables
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(varName => console.error(`   - ${varName}`));
        console.error('\nPlease set these in your .env file');
        console.error('See .env.example for reference\n');
        process.exit(1);
    }

    // Report warnings for recommended variables
    if (warnings.length > 0) {
        console.warn('⚠️  Missing recommended environment variables:');
        warnings.forEach(varName => console.warn(`   - ${varName}`));
        console.warn('\nSome features may not work without these\n');
    }

    // Validate specific values
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  JWT_SECRET should be at least 32 characters long\n');
    }

    if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
        console.warn(`⚠️  NODE_ENV should be 'development', 'production', or 'test'\n`);
    }

    console.log('✅ Environment validation passed\n');
}

module.exports = validateEnvironment;
