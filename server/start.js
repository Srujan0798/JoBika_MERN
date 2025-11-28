const dns = require('dns');
const { URL } = require('url');

async function start() {
    console.log('🚀 Starting JoBika Server with DNS Resolution...');

    // Force use of public DNS servers (Google, Cloudflare) to get IPv4
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    console.log('✅ Set DNS servers to: 8.8.8.8, 1.1.1.1, 8.8.4.4');

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')) {
        try {
            const dbUrl = new URL(process.env.DATABASE_URL);
            const hostname = dbUrl.hostname;

            console.log(`🔍 Resolving ${hostname} via public DNS...`);

            // Use resolve4 to explicitly get IPv4 addresses
            const addresses = await dns.promises.resolve4(hostname);

            if (addresses && addresses.length > 0) {
                const ip = addresses[0];
                console.log(`✅ Resolved to IPv4: ${ip}`);
                dbUrl.hostname = ip;
                process.env.DATABASE_URL = dbUrl.toString();
                console.log('✅ Updated DATABASE_URL with IPv4 address');
            } else {
                console.warn('⚠️ No IPv4 addresses found, using original hostname');
            }
        } catch (error) {
            console.error('❌ DNS Resolution Failed:', error.message);
            console.error('   Using original DATABASE_URL');
        }
    }

    // Start the main application
    require('./index.js');
}

start();
