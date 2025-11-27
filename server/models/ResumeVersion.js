const mongoose = require('mongoose');

const ResumeVersionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    baseResume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    versionName: {
        type: String,
        required: true,
        trim: true,
    },
    customizedSummary: {
        type: String,
    },
    customizedSkills: {
        type: [String],
        default: [],
    },
    highlightedExperience: {
        type: [String],
        default: [],
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Index for faster queries
ResumeVersionSchema.index({ user: 1, job: 1 });
ResumeVersionSchema.index({ baseResume: 1 });

module.exports = mongoose.model('ResumeVersion', ResumeVersionSchema);
