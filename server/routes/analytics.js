const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const SkillGap = require('../models/SkillGap');
const Resume = require('../models/Resume');

// @route   GET api/analytics
// @desc    Get user analytics and market insights
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Application stats
        const totalApplications = await Application.countDocuments({ user: req.user.id });
        const applicationsByStatus = await Application.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusCounts = {};
        applicationsByStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        // Average match score
        const avgMatchScore = await Application.aggregate([
            { $match: { user: req.user.id } },
            { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
        ]);

        // Recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentApplications = await Application.countDocuments({
            user: req.user.id,
            appliedDate: { $gte: thirtyDaysAgo },
        });

        // Top companies applied to
        const topCompanies = await Application.aggregate([
            { $match: { user: req.user.id } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobData',
                },
            },
            { $unwind: '$jobData' },
            {
                $group: {
                    _id: '$jobData.company',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Market insights
        const totalJobs = await Job.countDocuments();
        const jobsBySource = await Job.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
        ]);

        const sourceCounts = {};
        jobsBySource.forEach(item => {
            sourceCounts[item._id] = item.count;
        });

        // Most common skills required
        const topSkills = await Job.aggregate([
            { $unwind: '$requiredSkills' },
            { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        res.json({
            applicationStats: {
                total: totalApplications,
                byStatus: statusCounts,
                averageMatchScore: avgMatchScore[0]?.avgScore || 0,
                last30Days: recentApplications,
                topCompanies: topCompanies.map(c => ({ company: c._id, count: c.count })),
            },
            marketInsights: {
                totalJobs,
                bySource: sourceCounts,
                topSkills: topSkills.map(s => ({ skill: s._id, count: s.count })),
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/learning-recommendations
// @desc    Get learning recommendations based on skill gaps
// @access  Private
router.get('/learning-recommendations', auth, async (req, res) => {
    try {
        // Get user's latest resume
        const resume = await Resume.findOne({ user: req.user.id }).sort({ uploadedAt: -1 });
        if (!resume) {
            return res.status(404).json({ msg: 'No resume found' });
        }

        // Get recent skill gap analyses
        const skillGaps = await SkillGap.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Aggregate missing skills from all analyses
        const skillFrequency = {};
        const allRecommendations = [];

        skillGaps.forEach(gap => {
            gap.missingSkills.forEach(skill => {
                skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
            });
            allRecommendations.push(...gap.recommendations);
        });

        // Sort skills by frequency
        const sortedSkills = Object.entries(skillFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([skill, count]) => ({ skill, frequency: count }));

        // Get unique recommendations (prioritize by frequency)
        const uniqueRecommendations = [];
        const seenSkills = new Set();

        for (const rec of allRecommendations) {
            if (!seenSkills.has(rec.skill)) {
                seenSkills.add(rec.skill);
                uniqueRecommendations.push({
                    ...rec,
                    frequency: skillFrequency[rec.skill] || 1,
                });
            }
        }

        // Sort by priority and frequency
        uniqueRecommendations.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.frequency - a.frequency;
        });

        res.json({
            currentSkills: resume.skills,
            missingSkills: sortedSkills.slice(0, 10),
            recommendations: uniqueRecommendations.slice(0, 10),
            analysisCount: skillGaps.length,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
