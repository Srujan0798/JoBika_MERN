const { Job, Application, UserPreference, Resume, User } = require('../models');
const { Op } = require('sequelize');
const { calculateMatchScore } = require('./resumeParser');
const { sendApplicationConfirmation } = require('./emailService');

/**
 * Auto-Apply System - Automatically applies to matching jobs
 */
class AutoApplySystem {
    /**
     * Process auto-apply for a user
     */
    async processAutoApplyForUser(userId) {
        try {
            // Get user preferences
            const preferences = await UserPreference.findOne({ where: { userId } });
            if (!preferences || !preferences.autoApplyEnabled) {
                return { success: false, message: 'Auto-apply not enabled' };
            }

            // Get user's resume
            const resume = await Resume.findOne({
                where: { userId },
                order: [['uploadedAt', 'DESC']]
            });

            if (!resume) {
                return { success: false, message: 'No resume found' };
            }

            // Find matching jobs
            const matchingJobs = await this.findMatchingJobs(resume, preferences);

            // Check daily limit
            const todayApplications = await this.getTodayApplicationsCount(userId);
            const remainingLimit = preferences.dailyApplicationLimit - todayApplications;

            if (remainingLimit <= 0) {
                return {
                    success: false,
                    message: 'Daily application limit reached',
                    todayApplications
                };
            }

            // Apply to jobs
            const applicationsCreated = [];
            const jobsToApply = matchingJobs.slice(0, remainingLimit);

            for (const job of jobsToApply) {
                try {
                    const application = await this.applyToJob(userId, job, resume);
                    applicationsCreated.push(application);
                } catch (error) {
                    console.error(`Failed to apply to job ${job.id}:`, error);
                }
            }

            return {
                success: true,
                applications: applicationsCreated.length,
                todayTotal: todayApplications + applicationsCreated.length,
                matchingJobsFound: matchingJobs.length,
            };
        } catch (error) {
            console.error('Auto-apply error:', error);
            throw error;
        }
    }

    /**
     * Find jobs matching user preferences
     */
    async findMatchingJobs(resume, preferences) {
        const where = {};

        // Filter by location
        if (preferences.targetLocations && preferences.targetLocations.length > 0) {
            where.location = { [Op.in]: preferences.targetLocations };
        }

        // Filter by source
        if (preferences.preferredSources && preferences.preferredSources.length > 0) {
            where.source = { [Op.in]: preferences.preferredSources };
        }

        // Get jobs
        const jobs = await Job.findAll({
            where,
            limit: 100,
            raw: true
        });

        // Calculate match scores and filter
        const jobsWithScores = jobs.map(job => {
            const matchScore = calculateMatchScore(
                resume.skills || [],
                job.requiredSkills || []
            );
            return { ...job, matchScore };
        });

        // Filter by minimum match score
        const matchingJobs = jobsWithScores.filter(
            job => job.matchScore >= preferences.minMatchScore
        );

        // Sort by match score
        matchingJobs.sort((a, b) => b.matchScore - a.matchScore);

        return matchingJobs;
    }

    /**
     * Get count of applications made today
     */
    async getTodayApplicationsCount(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await Application.count({
            where: {
                userId,
                appliedDate: { [Op.gte]: today },
            }
        });

        return count;
    }

    /**
     * Apply to a job
     */
    async applyToJob(userId, job, resume) {
        // Check if already applied
        const existingApplication = await Application.findOne({
            where: {
                userId,
                jobId: job.id,
            }
        });

        if (existingApplication) {
            throw new Error('Already applied to this job');
        }

        // Create application
        const application = await Application.create({
            userId,
            jobId: job.id,
            resumeId: resume.id,
            status: 'applied',
            matchScore: job.matchScore,
            appliedDate: new Date(),
        });

        // Send confirmation email (async, don't wait)
        this.sendConfirmationEmail(userId, job).catch(err =>
            console.error('Failed to send confirmation:', err)
        );

        return application;
    }

    /**
     * Send confirmation email
     */
    async sendConfirmationEmail(userId, job) {
        const user = await User.findByPk(userId);
        if (user && user.email) {
            await sendApplicationConfirmation(
                user.email,
                user.fullName,
                job.title,
                job.company,
                job.matchScore
            );
        }
    }
}

module.exports = AutoApplySystem;
