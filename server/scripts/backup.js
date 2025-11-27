/**
 * Database Backup Script
 * Creates backups of MongoDB database
 * 
 * Usage: node scripts/backup.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobika';
const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

    console.log('🔄 Starting database backup...');
    console.log(`📁 Backup location: ${backupPath}`);

    const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Backup failed:', error.message);
            return;
        }

        if (stderr) {
            console.error('⚠️  Warnings:', stderr);
        }

        console.log('✅ Backup completed successfully!');
        console.log(stdout);

        // Show backup size
        exec(`du -sh "${backupPath}"`, (err, size) => {
            if (!err) {
                console.log(`📊 Backup size: ${size.trim()}`);
            }
        });

        // Clean old backups (keep last 7 days)
        cleanOldBackups();
    });
}

function cleanOldBackups() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) return;

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;

                if (stats.isDirectory() && stats.mtime < sevenDaysAgo) {
                    exec(`rm -rf "${filePath}"`, (err) => {
                        if (!err) {
                            console.log(`🗑️  Deleted old backup: ${file}`);
                        }
                    });
                }
            });
        });
    });
}

function restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
        console.error('❌ Backup not found:', backupPath);
        return;
    }

    console.log('🔄 Restoring database from backup...');
    console.log(`📁 Source: ${backupPath}`);

    const command = `mongorestore --uri="${MONGODB_URI}" --drop "${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Restore failed:', error.message);
            return;
        }

        if (stderr) {
            console.error('⚠️  Warnings:', stderr);
        }

        console.log('✅ Restore completed successfully!');
        console.log(stdout);
    });
}

function listBackups() {
    console.log('📋 Available backups:\n');

    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            console.error('❌ Error reading backups:', err.message);
            return;
        }

        if (files.length === 0) {
            console.log('No backups found.');
            return;
        }

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                console.log(`  📦 ${file} (${stats.mtime.toLocaleString()})`);
            }
        });
    });
}

// Command line interface
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
    case 'create':
    case 'backup':
        createBackup();
        break;

    case 'restore':
        if (!arg) {
            console.error('❌ Please specify backup name');
            console.log('Usage: node scripts/backup.js restore <backup-name>');
        } else {
            restoreBackup(arg);
        }
        break;

    case 'list':
        listBackups();
        break;

    default:
        console.log('MongoDB Backup Utility');
        console.log('\nUsage:');
        console.log('  node scripts/backup.js create         - Create new backup');
        console.log('  node scripts/backup.js list           - List all backups');
        console.log('  node scripts/backup.js restore <name> - Restore from backup');
        break;
}
