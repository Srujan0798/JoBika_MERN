/**
 * Database Statistics and Monitoring
 * Provides insights into database usage and health
 * 
 * Usage: node scripts/dbStats.js
 */

const { sequelize } = require('../config/database');
const { User, Resume, Job, Application, Notification } = require('../models');
require('dotenv').config();

async function getTableStats(Model, name) {
    const count = await Model.count();

    // Get table size from PostgreSQL
    const tableName = Model.tableName;
    const [sizeResult] = await sequelize.query(`
        SELECT 
            pg_size_pretty(pg_total_relation_size('${tableName}')) as total_size,
            pg_size_pretty(pg_relation_size('${tableName}')) as table_size,
            pg_size_pretty(pg_indexes_size('${tableName}')) as indexes_size
    `);

    return {
        name,
        count,
        totalSize: sizeResult[0]?.total_size || '0 bytes',
        tableSize: sizeResult[0]?.table_size || '0 bytes',
        indexesSize: sizeResult[0]?.indexes_size || '0 bytes'
    };
}

async function showDatabaseStats() {
    try {
        console.log('📊 JoBika Database Statistics\n');

        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL (Supabase)\n');

        // Get stats for each table
        const tables = [
            { model: User, name: 'Users' },
            { model: Resume, name: 'Resumes' },
            { model: Job, name: 'Jobs' },
            { model: Application, name: 'Applications' },
            { model: Notification, name: 'Notifications' }
        ];

        console.log('Table Statistics:');
        console.log('─'.repeat(80));
        console.log(
            'Table'.padEnd(20) +
            'Rows'.padEnd(15) +
            'Table Size'.padEnd(15) +
            'Indexes Size'.padEnd(15) +
            'Total Size'
        );
        console.log('─'.repeat(80));

        let totalDocs = 0;
        for (const { model, name } of tables) {
            const stats = await getTableStats(model, name);
            totalDocs += stats.count;

            console.log(
                stats.name.padEnd(20) +
                stats.count.toString().padEnd(15) +
                stats.tableSize.padEnd(15) +
                stats.indexesSize.padEnd(15) +
                stats.totalSize
            );
        }

        console.log('─'.repeat(80));
        console.log(`Total Rows: ${totalDocs}\n`);

        // Database size
        const [dbSizeResult] = await sequelize.query(`
            SELECT 
                pg_database.datname as database_name,
                pg_size_pretty(pg_database_size(pg_database.datname)) as size
            FROM pg_database
            WHERE datname = current_database()
        `);

        console.log('Database Information:');
        console.log(`  Database Name: ${dbSizeResult[0]?.database_name || 'N/A'}`);
        console.log(`  Total Size: ${dbSizeResult[0]?.size || 'N/A'}\n`);

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const recentApps = await Application.count({
            where: {
                createdAt: { [sequelize.Op.gte]: sevenDaysAgo }
            }
        });

        const recentJobs = await Job.count({
            where: {
                createdAt: { [sequelize.Op.gte]: sevenDaysAgo }
            }
        });

        console.log('Recent Activity (Last 7 days):');
        console.log(`  New Applications: ${recentApps}`);
        console.log(`  New Jobs: ${recentJobs}\n`);

        // Top users by applications
        const topUsers = await Application.findAll({
            attributes: [
                'userId',
                [sequelize.fn('COUNT', sequelize.col('Application.id')), 'count']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['email', 'fullName']
            }],
            group: ['userId', 'user.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('Application.id')), 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });

        if (topUsers.length > 0) {
            console.log('Top 5 Most Active Users:');
            topUsers.forEach((row, i) => {
                const name = row.user?.fullName || row.user?.email || 'Unknown';
                console.log(`  ${i + 1}. ${name} - ${row.count} applications`);
            });
            console.log('');
        }

        // Index information
        const [indexInfo] = await sequelize.query(`
            SELECT 
                schemaname,
                tablename,
                indexname,
                pg_size_pretty(pg_relation_size(indexrelid)) as index_size
            FROM pg_indexes
            JOIN pg_class ON pg_class.relname = indexname
            WHERE schemaname = 'public'
            ORDER BY pg_relation_size(indexrelid) DESC
            LIMIT 10
        `);

        if (indexInfo.length > 0) {
            console.log('Top 10 Largest Indexes:');
            indexInfo.forEach(idx => {
                console.log(`  ${idx.tablename}.${idx.indexname}: ${idx.index_size}`);
            });
            console.log('');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

showDatabaseStats();
