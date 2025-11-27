/**
 * Database Statistics and Monitoring
 * Provides insights into database usage and health
 * 
 * Usage: node scripts/dbStats.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobika';

async function getCollectionStats(Model, name) {
    const count = await Model.countDocuments();
    const stats = await Model.collection.stats();

    return {
        name,
        count,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        avgObjSize: stats.avgObjSize ? (stats.avgObjSize / 1024).toFixed(2) + ' KB' : '0 KB',
        indexes: stats.nindexes
    };
}

async function showDatabaseStats() {
    try {
        console.log('📊 JoBika Database Statistics\n');

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Get stats for each collection
        const collections = [
            { model: User, name: 'Users' },
            { model: Resume, name: 'Resumes' },
            { model: Job, name: 'Jobs' },
            { model: Application, name: 'Applications' },
            { model: Notification, name: 'Notifications' }
        ];

        console.log('Collection Statistics:');
        console.log('─'.repeat(70));
        console.log(
            'Collection'.padEnd(20) +
            'Documents'.padEnd(15) +
            'Size'.padEnd(15) +
            'Avg Size'.padEnd(15) +
            'Indexes'
        );
        console.log('─'.repeat(70));

        let totalDocs = 0;
        for (const { model, name } of collections) {
            const stats = await getCollectionStats(model, name);
            totalDocs += stats.count;

            console.log(
                stats.name.padEnd(20) +
                stats.count.toString().padEnd(15) +
                stats.size.padEnd(15) +
                stats.avgObjSize.padEnd(15) +
                stats.indexes.toString()
            );
        }

        console.log('─'.repeat(70));
        console.log(`Total Documents: ${totalDocs}\n`);

        // Database size
        const dbStats = await mongoose.connection.db.stats();
        console.log('Database Information:');
        console.log(`  Database Name: ${dbStats.db}`);
        console.log(`  Total Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Number of Collections: ${dbStats.collections}`);
        console.log(`  Number of Indexes: ${dbStats.indexes}\n`);

        // Recent activity
        const recentApps = await Application.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        const recentJobs = await Job.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        console.log('Recent Activity (Last 7 days):');
        console.log(`  New Applications: ${recentApps}`);
        console.log(`  New Jobs: ${recentJobs}\n`);

        // Top users by applications
        const topUsers = await Application.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $project: { email: '$user.email', fullName: '$user.fullName', count: 1 } }
        ]);

        if (topUsers.length > 0) {
            console.log('Top 5 Most Active Users:');
            topUsers.forEach((user, i) => {
                console.log(`  ${i + 1}. ${user.fullName || user.email} - ${user.count} applications`);
            });
            console.log('');
        }

        // Index information
        console.log('Index Usage:');
        const indexStats = await Job.collection.stats();
        if (indexStats.indexSizes) {
            Object.entries(indexStats.indexSizes).forEach(([name, size]) => {
                console.log(`  ${name}: ${(size / 1024).toFixed(2)} KB`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

showDatabaseStats();
