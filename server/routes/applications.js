const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { calculateMatchScore } = require('../services/resumeParser');
const { sendApplicationConfirmation } = require('../services/emailService');
const User = require('../models/User');

// @route   POST api/applications
// @desc    Create job application
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { jobId, notes } = req.body;

        // Get job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            user: req.user.id,
            job: jobId,
        });

        if (existingApplication) {
            return res.status(400).json({ msg: 'Already applied to this job' });
        }

        // Get user's latest resume
        const resume = await Resume.findOne({ user: req.user.id }).sort({ uploadedAt: -1 });
        if (!resume) {
            return res.status(404).json({ msg: 'No resume found. Please upload a resume first.' });
        }

        // Calculate match score
        const matchScore = calculateMatchScore(resume.skills, job.requiredSkills);

        // Create application
        const application = new Application({
            user: req.user.id,
            job: jobId,
            resume: resume._id,
            status: 'applied',
            matchScore,
            notes,
        });

        await application.save();

        // Send confirmation email
        const user = await User.findById(req.user.id);
        if (user) {
            try {
                await sendApplicationConfirmation(
                    user.email,
                    user.fullName,
                    job.title,
                    job.company,
                    matchScore
                );
            } catch (error) {
                console.error('Failed to send application confirmation:', error);
            }
        }

        // Create notification
        await new Notification({
            user: req.user.id,
            title: 'Application Submitted',
            message: `Successfully applied to ${job.title} at ${job.company}. Match score: ${matchScore}%`,
            type: 'success',
        }).save();

        res.json({
            id: application._id,
            jobId,
            status: application.status,
            matchScore,
            appliedDate: application.appliedDate,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.user.id };

        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('job', 'title company location salary source')
            .populate('resume', 'originalName')
            .sort({ appliedDate: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('job')
            .populate('resume');

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Make sure user owns this application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Application not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/applications/:id
// @desc    Update application status
// @access  Private
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Make sure user owns this application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (status) {
            application.status = status;
        }
        if (notes !== undefined) {
            application.notes = notes;
        }

        await application.save();

        // Create notification for status change
        if (status && status !== 'applied') {
            const job = await Job.findById(application.job);
            const statusMessages = {
                screening: 'Your application is being screened',
                interviewing: 'Congratulations! You have an interview',
                offered: 'Congratulations! You received a job offer',
                rejected: 'Application was not selected',
                withdrawn: 'Application withdrawn',
            };

            await new Notification({
                user: req.user.id,
                title: 'Application Status Updated',
                message: `${job.title} at ${job.company}: ${statusMessages[status]}`,
                type: status === 'offered' ? 'success' : status === 'rejected' ? 'error' : 'info',
            }).save();
        }

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        // Make sure user owns this application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await application.deleteOne();

        res.json({ msg: 'Application removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Application not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
