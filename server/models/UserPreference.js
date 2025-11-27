const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // Auto-apply settings
    autoApplyEnabled: {
        type: Boolean,
        default: false,
    },
    targetRoles: {
        type: [String],
        default: [],
    },
    targetLocations: {
        type: [String],
        default: [],
    },
    salaryRange: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
    },
    jobTypes: {
        type: [String],
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        default: ['full-time'],
    },
    experienceLevel: {
        type: [String],
        enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
        default: [],
    },
    preferredSources: {
        type: [String],
        enum: ['linkedin', 'indeed', 'naukri', 'unstop'],
        default: ['linkedin', 'indeed', 'naukri'],
    },
    minMatchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 60,
    },
    dailyApplicationLimit: {
        type: Number,
        default: 10,
    },
    notificationSettings: {
        emailAlerts: {
            type: Boolean,
            default: true,
        },
        applicationUpdates: {
            type: Boolean,
            default: true,
        },
        jobRecommendations: {
            type: Boolean,
            default: true,
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
