const BASE_URL = 'https://jobika-pern.onrender.com/api';

async function verify() {
    console.log('🔍 Verifying JoBika Production...');

    try {
        // 1. Health
        const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
        console.log('✅ Health:', health.status);

        // 2. Database Connection (via Debug Endpoint)
        const db = await fetch(`${BASE_URL}/debug-db`).then(r => r.json());
        if (db.status === 'connected') {
            console.log('✅ Database: Connected');
            console.log('   Tables:', db.tables.length);
        } else {
            console.log('❌ Database Error:', db.message);
        }

        // 3. Jobs (Public)
        const jobs = await fetch(`${BASE_URL}/jobs`).then(r => r.json());
        console.log('✅ Jobs Endpoint:', jobs.length !== undefined ? 'OK' : 'Failed');

    } catch (e) {
        console.error('❌ Verification Failed:', e.message);
    }
}

verify();
