const nodemailer = require('nodemailer');
const config = require('../config/config');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(email, fullName) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to JoBika! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Welcome to JoBika, ${fullName}!</h2>
                    <p>Thank you for joining JoBika - your AI-powered job application assistant.</p>
                    <p>Here's what you can do:</p>
                    <ul>
                        <li>Upload your resume and let AI parse it</li>
                        <li>Browse jobs from LinkedIn, Indeed, Naukri, and Unstop</li>
                        <li>Get AI-customized resumes for each job</li>
                        <li>Analyze skill gaps and get learning recommendations</li>
                        <li>Set up auto-apply to apply while you sleep</li>
                    </ul>
                    <p>Get started by uploading your resume!</p>
                    <p>Best regards,<br>The JoBika Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return false;
    }
}

/**
 * Send application confirmation email
 */
async function sendApplicationConfirmation(email, fullName, jobTitle, company, matchScore) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Application Submitted: ${jobTitle} at ${company}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Application Submitted Successfully! ✅</h2>
                    <p>Hi ${fullName},</p>
                    <p>Your application has been submitted for:</p>
                    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${jobTitle}</h3>
                        <p style="margin: 5px 0;"><strong>Company:</strong> ${company}</p>
                        <p style="margin: 5px 0;"><strong>Match Score:</strong> ${matchScore}%</p>
                    </div>
                    <p>We'll keep you updated on your application status.</p>
                    <p>Best regards,<br>The JoBika Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send application confirmation:', error);
        return false;
    }
}

/**
 * Send job alert email
 */
async function sendJobAlert(email, fullName, jobs) {
    try {
        const jobsHTML = jobs.map(job => `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0;">${job.title}</h4>
                <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
                <p style="margin: 5px 0;"><strong>Match Score:</strong> ${job.matchScore}%</p>
                <a href="${job.url}" style="color: #667eea;">View Job</a>
            </div>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${jobs.length} New Job Matches Found!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">New Job Matches for You! 🎯</h2>
                    <p>Hi ${fullName},</p>
                    <p>We found ${jobs.length} new jobs matching your preferences:</p>
                    ${jobsHTML}
                    <p>Login to JoBika to apply!</p>
                    <p>Best regards,<br>The JoBika Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send job alert:', error);
        return false;
    }
}

/**
 * Send skill recommendation email
 */
async function sendSkillRecommendationEmail(email, fullName, missingSkills, recommendations) {
    try {
        const skillsHTML = recommendations.map(rec => `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0;">${rec.skill}</h4>
                <p style="margin: 5px 0;"><strong>Priority:</strong> ${rec.priority}</p>
                <p style="margin: 5px 0;"><strong>Learning Time:</strong> ${rec.learningTime}</p>
                <p style="margin: 5px 0;"><strong>Resources:</strong></p>
                <ul>
                    ${rec.resources.map(r => `<li><a href="${r}" style="color: #667eea;">${r}</a></li>`).join('')}
                </ul>
            </div>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Skill Gap Analysis & Learning Recommendations',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Your Learning Path 📚</h2>
                    <p>Hi ${fullName},</p>
                    <p>Based on your skill gap analysis, here are some skills to learn:</p>
                    ${skillsHTML}
                    <p>Start learning today to improve your job match scores!</p>
                    <p>Best regards,<br>The JoBika Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send skill recommendation email:', error);
        return false;
    }
}

module.exports = {
    sendWelcomeEmail,
    sendApplicationConfirmation,
    sendJobAlert,
    sendSkillRecommendationEmail,
};
