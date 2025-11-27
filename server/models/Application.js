const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
    },
    status: {
        type: String,
        enum: ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'],
        default: 'applied',
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

// Indexes for faster queries
ApplicationSchema.index({ user: 1, appliedDate: -1 });
ApplicationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
