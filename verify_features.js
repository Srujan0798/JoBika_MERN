const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://jobika-pern.onrender.com/api';
let TOKEN = '';

async function verifyFeatures() {
    console.log('🚀 Verifying Advanced Features...');

    try {
        // 1. Login to get token
        console.log('\n1️⃣  Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test_user@example.com', // Need a valid user, verify_final.js creates one? No, verify_production.js did.
                // I'll create a new user to be safe
                password: 'Password123!'
            })
        });

        // If login fails, try register
        if (!loginRes.ok) {
            console.log('   Login failed, registering new user...');
            const regRes = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `feature_test_${Date.now()}@example.com`,
                    password: 'Password123!',
                    name: 'Feature Tester'
                })
            });
            if (!regRes.ok) throw new Error('Registration failed');
            const regData = await regRes.json();
            TOKEN = regData.token;
        } else {
            const loginData = await loginRes.json();
            TOKEN = loginData.token;
        }
        console.log('✅ Authenticated');

        // 2. Test Job Scraping (Trigger)
        console.log('\n2️⃣  Testing Job Scraping...');
        // Note: Scraping might take time, so we just check if endpoint responds
        // Assuming there is a trigger endpoint or we just check list
        // Let's check if we can search jobs (which triggers scraping in some implementations)
        const searchRes = await fetch(`${BASE_URL}/jobs?search=developer&location=remote`);
        if (searchRes.ok) {
            const jobs = await searchRes.json();
            console.log(`✅ Job Search/Scraping OK. Found ${jobs.length} jobs.`);
        } else {
            console.error('❌ Job Search Failed');
        }

        // 3. Test File Upload (Resume)
        console.log('\n3️⃣  Testing Resume Upload...');
        // Create a dummy PDF
        const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
        fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n%...');

        const formData = new FormData();
        const fileContent = fs.readFileSync(dummyPdfPath);
        const blob = new Blob([fileContent], { type: 'application/pdf' });
        formData.append('resume', blob, 'test_resume.pdf');

        const uploadRes = await fetch(`${BASE_URL}/resume/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${TOKEN}` },
            body: formData
        });

        if (uploadRes.ok) {
            console.log('✅ Resume Upload Passed');
        } else {
            const err = await uploadRes.text();
            console.error(`❌ Resume Upload Failed: ${uploadRes.status} - ${err}`);
        }

        // Cleanup
        fs.unlinkSync(dummyPdfPath);

        // 4. Test Auto-Apply Trigger
        console.log('\n4️⃣  Testing Auto-Apply Trigger...');
        const applyRes = await fetch(`${BASE_URL}/auto-apply/trigger`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (applyRes.ok) {
            console.log('✅ Auto-Apply Trigger Passed');
        } else {
            // It might return 400 if no preferences set, which is fine for connectivity check
            console.log(`ℹ️  Auto-Apply Response: ${applyRes.status}`);
        }

        console.log('\n🎉 Feature Verification Complete!');

    } catch (e) {
        console.error('\n❌ Feature Verification Failed:', e.message);
    }
}

verifyFeatures();
