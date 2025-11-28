const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
    let resolutionStatus = {};
    try {
        const statusPath = path.join(__dirname, '../resolution_status.json'); // Adjust path as needed
        // Actually start.js is in server/, debug.js is in server/routes/
        // So ../resolution_status.json is correct if start.js writes to CWD (server/)
        if (fs.existsSync('resolution_status.json')) {
            resolutionStatus = JSON.parse(fs.readFileSync('resolution_status.json', 'utf8'));
        }
    } catch (e) {
        resolutionStatus = { error: e.message };
    }

    try {
        await sequelize.authenticate();
        const tables = await sequelize.getQueryInterface().showAllSchemas();
        res.json({
            status: 'connected',
            resolution: resolutionStatus,
            message: 'Database connection successful',
            config: {
                database: sequelize.config.database,
                host: sequelize.config.host,
                port: sequelize.config.port,
                dialect: sequelize.config.dialect,
                ssl: sequelize.config.dialectOptions?.ssl
            },
            tables: tables
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            resolution: resolutionStatus,
            message: error.message,
            code: error.original?.code,
            detail: error.original?.detail
        });
    }
});

module.exports = router;
