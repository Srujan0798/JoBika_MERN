const dns = require('dns');
const { URL } = require('url');
const fs = require('fs');
const { execSync } = require('child_process');

const STATUS_FILE = 'resolution_status.json';

function logStatus(status) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

async function start() {
    console.log('🚀 Starting JoBika Server with DNS Resolution...');
    const status = { timestamp: new Date().toISOString(), attempts: [] };

    // Force use of public DNS servers (Google, Cloudflare) to get IPv4
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        status.dnsServers = dns.getServers();
    } catch (e) {
        status.dnsError = e.message;
    }

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')) {
        try {
            const dbUrl = new URL(process.env.DATABASE_URL);
            const hostname = dbUrl.hostname;
            status.hostname = hostname;

            // Attempt 1: Node DNS
            try {
                console.log(`🔍 Resolving ${hostname} via public DNS...`);
                const addresses = await dns.promises.resolve4(hostname);
                status.attempts.push({ method: 'dns.resolve4', result: addresses });

                if (addresses && addresses.length > 0) {
                    updateEnv(dbUrl, addresses[0], status);
                } else {
                    throw new Error('No addresses found');
                }
            } catch (dnsError) {
                status.attempts.push({ method: 'dns.resolve4', error: dnsError.message });

                // Attempt 2: Python Fallback
                try {
                    console.log('🐍 Trying Python fallback...');
                    const ip = execSync(`python3 -c "import socket; print(socket.gethostbyname('${hostname}'))"`).toString().trim();
                    status.attempts.push({ method: 'python', result: ip });
                    if (ip) {
                        updateEnv(dbUrl, ip, status);
                    }
                } catch (pyError) {
                    status.attempts.push({ method: 'python', error: pyError.message });
                }
            }

        } catch (error) {
            status.error = error.message;
            console.error('❌ DNS Resolution Failed:', error.message);
        }
    }

    logStatus(status);
    // Start the main application
    require('./index.js');
}

function updateEnv(dbUrl, ip, status) {
    console.log(`✅ Resolved to IPv4: ${ip}`);
    dbUrl.hostname = ip;

    // Also switch to port 6543 (Supavisor) for better connectivity
    if (dbUrl.port === '5432') {
        console.log('✅ Switching to Supavisor port 6543');
        dbUrl.port = '6543';
    }

    process.env.DATABASE_URL = dbUrl.toString();
    status.success = true;
    status.finalUrl = process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'); // Mask password
    console.log('✅ Updated DATABASE_URL');
}

start();
