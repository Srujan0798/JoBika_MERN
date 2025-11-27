/**
 * Generate More Jobs - Creates additional job listings
 * 
 * Usage: node scripts/generateJobs.js [count]
 * Example: node scripts/generateJobs.js 50
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobika';

const jobTitles = [
    'Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Scientist',
    'ML Engineer',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer',
    'Mobile Developer',
    'Cloud Architect',
];

const companies = [
    'Google', 'Meta', 'Amazon', 'Apple', 'Microsoft',
    'Netflix', 'Uber', 'Airbnb', 'Spotify', 'LinkedIn',
    'Twitter', 'Salesforce', 'Oracle', 'IBM', 'Adobe',
    'Flipkart', 'Swiggy', 'Zomato', 'PayTM', 'PhonePe',
    'Infosys', 'TCS', 'Wipro', 'HCL', 'Tech Mahindra',
];

const locations = [
    'Remote',
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Bangalore, India',
    'Mumbai, India',
    'Delhi, India',
    'Hyderabad, India',
    'Pune, India',
    'London, UK',
    'Berlin, Germany',
];

const skillSets = [
    ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    ['Python', 'Django', 'PostgreSQL', 'Redis'],
    ['Java', 'Spring', 'MySQL', 'Kafka'],
    ['TypeScript', 'Angular', 'GraphQL', 'AWS'],
    ['Go', 'Kubernetes', 'Docker', 'GCP'],
    ['Ruby', 'Rails', 'PostgreSQL', 'Heroku'],
    ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
    ['C#', '.NET', 'Azure', 'SQL Server'],
];

const sources = ['linkedin', 'indeed', 'naukri', 'unstop'];

const postedDates = [
    'Just now',
    'Today',
    'Yesterday',
    '2 days ago',
    '3 days ago',
    '1 week ago',
    '2 weeks ago',
];

function generateSalary(location) {
    if (location.includes('India')) {
        const min = Math.floor(Math.random() * 20) + 10; // 10-30 LPA
        const max = min + Math.floor(Math.random() * 15) + 5;
        return `₹${min}-${max} LPA`;
    } else {
        const min = Math.floor(Math.random() * 100) + 80; // 80-180k
        const max = min + Math.floor(Math.random() * 50) + 20;
        return `$${min}k-${max}k USD`;
    }
}

function generateJob() {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const skills = skillSets[Math.floor(Math.random() * skillSets.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const postedDate = postedDates[Math.floor(Math.random() * postedDates.length)];

    return {
        title,
        company,
        location,
        salary: generateSalary(location),
        description: `We are looking for a talented ${title} to join our ${company} team. The ideal candidate will have experience with ${skills.join(', ')}.`,
        requiredSkills: skills,
        source,
        url: `https://${source}.com/jobs/${Math.random().toString(36).substring(7)}`,
        postedDate,
    };
}

async function generateJobs(count = 20) {
    try {
        console.log(`🏭 Generating ${count} job listings...\n`);

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        const jobs = [];
        for (let i = 0; i < count; i++) {
            const jobData = generateJob();
            const job = await Job.create(jobData);
            jobs.push(job);

            if ((i + 1) % 10 === 0) {
                console.log(`   ✅ Generated ${i + 1} jobs...`);
            }
        }

        console.log(`\n🎉 Successfully generated ${count} jobs!\n`);

        // Show some stats
        const bySource = {};
        const byLocation = {};

        jobs.forEach(job => {
            bySource[job.source] = (bySource[job.source] || 0) + 1;
            byLocation[job.location] = (byLocation[job.location] || 0) + 1;
        });

        console.log('📊 Distribution by Source:');
        Object.entries(bySource).forEach(([source, count]) => {
            console.log(`   ${source}: ${count}`);
        });

        console.log('\n📍 Top Locations:');
        Object.entries(byLocation)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([location, count]) => {
                console.log(`   ${location}: ${count}`);
            });

        console.log('');
        process.exit(0);
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

// Get count from command line or default to 20
const count = parseInt(process.argv[2]) || 20;
generateJobs(count);
