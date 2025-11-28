const BASE_URL = 'https://jobika-pern.onrender.com/api';
const TEST_USER = {
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test User'
};

async function verifyProduction() {
    console.log('🚀 Starting Production Verification...');
    console.log(`Target: ${BASE_URL}\n`);

    try {
        // 1. Health Check
        console.log('1️⃣  Testing Health Endpoint...');
        const healthRes = await fetch(`${BASE_URL}/health`);
        if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
        const health = await healthRes.json();
        console.log('✅ Health Check Passed:', health);

        // 2. Registration
        console.log('\n2️⃣  Testing User Registration...');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            throw new Error(`Registration failed: ${registerRes.status} - ${err}`);
        }

        const registerData = await registerRes.json();
        const token = registerData.token;
        console.log('✅ Registration Passed. Token received.');

        // 3. Login
        console.log('\n3️⃣  Testing User Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} - ${err}`);
        }
        console.log('✅ Login Passed.');

        // 4. Get Jobs (Public)
        console.log('\n4️⃣  Testing Get Jobs (Public)...');
        const jobsRes = await fetch(`${BASE_URL}/jobs`);
        if (!jobsRes.ok) throw new Error(`Get Jobs failed: ${jobsRes.status}`);
        const jobs = await jobsRes.json();
        console.log(`✅ Get Jobs Passed. Found ${jobs.length || 0} jobs.`);

        // 5. Protected Route (Get Profile)
        console.log('\n5️⃣  Testing Protected Route (Get Profile)...');
        const profileRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
        const profile = await profileRes.json();
        console.log('✅ Protected Route Passed:', profile.email);

        console.log('\n🎉 ALL PRODUCTION TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ Verification Failed:');
        console.error(error.message);
        process.exit(1);
    }
}

verifyProduction();
