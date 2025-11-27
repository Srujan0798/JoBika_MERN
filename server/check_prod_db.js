const { Client } = require('pg');

const connectionString = 'postgresql://postgres:23110081aaiiTgn@db.gvybvfbnqgzcisuchocz.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
    console.log('🔌 Connecting to Supabase...');
    try {
        await client.connect();
        console.log('✅ Connected!');

        console.log('\n📊 Checking Tables...');
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        if (res.rows.length === 0) {
            console.log('❌ NO TABLES FOUND! Database is empty.');
        } else {
            console.log('✅ Tables found:');
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
}

checkDatabase();
