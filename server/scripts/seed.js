/**
 * Database Seeder - Populates database with sample data for testing
 * 
 * Usage: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const UserPreference = require('../models/UserPreference');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobika';

// Sample data
const sampleUsers = [
    {
        email: 'demo@jobika.com',
        password: 'demo123',
        fullName: 'Demo User',
        phone: '+1234567890',
    },
    {
        email: 'john.doe@example.com',
        password: 'password123',
        fullName: 'John Doe',
        phone: '+1987654321',
    },
];

const sampleJobs = [
    {
        title: 'Senior Full Stack Developer',
        company: 'Google',
        location: 'Remote',
        salary: '$150k-$200k USD',
        description: 'Looking for an experienced full stack developer to join our team. Must have 5+ years experience with React, Node.js, and MongoDB.',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
        source: 'linkedin',
        url: 'https://google.com/careers/job1',
        postedDate: 'Today',
    },
    {
        title: 'Frontend Engineer',
        company: 'Meta',
        location: 'San Francisco, CA',
        salary: '$140k-$180k USD',
        description: 'Join our frontend team building the next generation of social media. React and TypeScript expertise required.',
        requiredSkills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        source: 'indeed',
        url: 'https://meta.com/careers/job2',
        postedDate: 'Yesterday',
    },
    {
        title: 'Backend Developer',
        company: 'Amazon',
        location: 'Seattle, WA',
        salary: '$130k-$170k USD',
        description: 'Build scalable backend services using Node.js, Python, and AWS.',
        requiredSkills: ['Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
        source: 'linkedin',
        url: 'https://amazon.jobs/job3',
        postedDate: '2 days ago',
    },
    {
        title: 'Software Engineer - India',
        company: 'Flipkart',
        location: 'Bangalore, India',
        salary: '₹25-35 LPA',
        description: 'Join India\'s leading e-commerce company. Work on high-scale systems.',
        requiredSkills: ['Java', 'Spring', 'Redis', 'MySQL'],
        source: 'naukri',
        url: 'https://flipkart.careers/job4',
        postedDate: '1 week ago',
    },
    {
        title: 'DevOps Engineer',
        company: 'Netflix',
        location: 'Remote',
        salary: '$160k-$220k USD',
        description: 'Build and maintain our cloud infrastructure. AWS, Kubernetes, and Terraform experience required.',
        requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
        source: 'linkedin',
        url: 'https://netflix.jobs/job5',
        postedDate: 'Today',
    },
];

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Resume.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await UserPreference.deleteMany({});
    console.log('✅ Database cleared');
}

async function seedUsers() {
    console.log('👥 Creating users...');
    const users = [];

    for (const userData of sampleUsers) {
        const user = await User.create(userData);
        users.push(user);
        console.log(`   ✅ Created user: ${user.email}`);
    }

    return users;
}

async function seedJobs() {
    console.log('💼 Creating jobs...');
    const jobs = [];

    for (const jobData of sampleJobs) {
        const job = await Job.create(jobData);
        jobs.push(job);
        console.log(`   ✅ Created job: ${job.title} at ${job.company}`);
    }

    return jobs;
}

async function seedResumes(users) {
    console.log('📄 Creating resumes...');
    const resumes = [];

    for (const user of users) {
        const resume = await Resume.create({
            user: user._id,
            originalName: `${user.fullName.replace(' ', '_')}_Resume.pdf`,
            path: `/uploads/sample_resume_${user._id}.pdf`,
            parsedContent: `Experienced software developer with 5 years of experience in JavaScript, React, and Node.js.`,
            enhancedText: `Senior software developer specializing in full-stack development with JavaScript, React, Node.js, and MongoDB.`,
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Git'],
            experienceYears: 5,
            extractedInfo: {
                name: user.fullName,
                email: user.email,
                phone: user.phone,
            },
        });
        resumes.push(resume);
        console.log(`   ✅ Created resume for ${user.fullName}`);
    }

    return resumes;
}

async function seedApplications(users, jobs, resumes) {
    console.log('📝 Creating applications...');

    // User 1 applies to first 3 jobs
    for (let i = 0; i < 3; i++) {
        const application = await Application.create({
            user: users[0]._id,
            job: jobs[i]._id,
            resume: resumes[0]._id,
            status: i === 0 ? 'interviewing' : 'applied',
            matchScore: 85 - (i * 10),
            notes: `Interested in this position`,
        });
        console.log(`   ✅ Created application: ${users[0].fullName} → ${jobs[i].title}`);
    }

    // User 2 applies to last 2 jobs
    for (let i = 3; i < 5; i++) {
        const application = await Application.create({
            user: users[1]._id,
            job: jobs[i]._id,
            resume: resumes[1]._id,
            status: 'applied',
            matchScore: 75,
            notes: `Applied via JoBika`,
        });
        console.log(`   ✅ Created application: ${users[1].fullName} → ${jobs[i].title}`);
    }
}

async function seedNotifications(users) {
    console.log('🔔 Creating notifications...');

    const notifications = [
        {
            user: users[0]._id,
            title: 'Welcome to JoBika!',
            message: 'Your account has been successfully created.',
            type: 'success',
            isRead: true,
        },
        {
            user: users[0]._id,
            title: 'Application Submitted',
            message: 'Successfully applied to Senior Full Stack Developer at Google',
            type: 'success',
            isRead: false,
        },
        {
            user: users[0]._id,
            title: 'Interview Scheduled',
            message: 'Your application for Senior Full Stack Developer is now in interviewing stage',
            type: 'info',
            isRead: false,
        },
    ];

    for (const notif of notifications) {
        await Notification.create(notif);
        console.log(`   ✅ Created notification: ${notif.title}`);
    }
}

async function seedUserPreferences(users, resumes) {
    console.log('⚙️  Creating user preferences...');

    await UserPreference.create({
        user: users[0]._id,
        autoApplyEnabled: true,
        targetRoles: ['Full Stack Developer', 'Software Engineer'],
        targetLocations: ['Remote', 'San Francisco'],
        salaryRange: {
            min: 120000,
            max: 200000,
            currency: 'USD',
        },
        jobTypes: ['full-time', 'remote'],
        experienceLevel: ['mid', 'senior'],
        preferredSources: ['linkedin', 'indeed'],
        minMatchScore: 70,
        dailyApplicationLimit: 5,
        notificationSettings: {
            emailAlerts: true,
            applicationUpdates: true,
            jobRecommendations: true,
        },
    });
    console.log(`   ✅ Created preferences for ${users[0].fullName}`);
}

async function seed() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        await clearDatabase();
        console.log('');

        // Seed data
        const users = await seedUsers();
        console.log('');

        const jobs = await seedJobs();
        console.log('');

        const resumes = await seedResumes(users);
        console.log('');

        await seedApplications(users, jobs, resumes);
        console.log('');

        await seedNotifications(users);
        console.log('');

        await seedUserPreferences(users, resumes);
        console.log('');

        console.log('🎉 Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   • ${users.length} users`);
        console.log(`   • ${jobs.length} jobs`);
        console.log(`   • ${resumes.length} resumes`);
        console.log(`   • 5 applications`);
        console.log(`   • 3 notifications`);
        console.log(`   • 1 user preference\n`);

        console.log('🔑 Test Credentials:');
        console.log('   Email: demo@jobika.com');
        console.log('   Password: demo123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run seeder
seed();
