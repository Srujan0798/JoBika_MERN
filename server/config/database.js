require('dotenv').config();
const { Sequelize } = require('sequelize');



const config = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/jobika_dev',
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co') ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL, // Will be replaced dynamically
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Supabase
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
let sequelize;

// We need to handle the async resolution. 
// Since module.exports is synchronous, we'll create the instance synchronously 
// but update the connection manager or create a wrapper.
// Actually, for the purpose of this fix, let's use a hack:
// We will use the original URL for initialization, but we'll try to resolve it 
// and update the configuration if possible. 
// OR better: We can't easily make this async.
// 
// ALTERNATIVE: Use the `beforeConnect` hook or similar? No.
// 
// Let's use `dns-sync` or just rely on the fact that `dns.lookup` (which pg uses) 
// respects `dns.setDefaultResultOrder`.
//
// Wait, I already added `dns.setDefaultResultOrder` in index.js.
// Maybe it needs to be here too? Or maybe `pg` uses `dns.lookup` which ignores it?
//
// Let's try adding `dns.setDefaultResultOrder` HERE as well, at the very top.

if (require('dns').setDefaultResultOrder) {
  require('dns').setDefaultResultOrder('ipv4first');
}

const commonOptions = {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions || {},
  hooks: {
    beforeConnect: async (config) => {
      // Force IPv4 resolution for Supabase to avoid ENETUNREACH
      if (config.host && !/^(\d{1,3}\.){3}\d{1,3}$/.test(config.host)) {
        try {
          const addresses = await dns.promises.resolve4(config.host);
          if (addresses && addresses.length > 0) {
            console.log(`✅ Resolved ${config.host} to ${addresses[0]}`);
            config.host = addresses[0];
          }
        } catch (err) {
          console.warn(`⚠️ Failed to resolve ${config.host} to IPv4:`, err.message);
        }
      }
    }
  }
};

if (dbConfig.url) {
  sequelize = new Sequelize(dbConfig.url, commonOptions);
} else {
  sequelize = new Sequelize({
    ...commonOptions,
    storage: dbConfig.storage,
  });
}

// Test connection
sequelize.authenticate()
  .then(() => {
    if (env === 'development') {
      console.log('✅ Database connection established successfully');
    }
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err.message);
  });

module.exports = {
  sequelize,
  config,
  Sequelize
};
