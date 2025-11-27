const mongoose = require('mongoose');

const SkillGapSchema = new mongoose.Schema({
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
    matchingSkills: {
        type: [String],
        default: [],
    },
    missingSkills: {
        type: [String],
        default: [],
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    recommendations: [{
        skill: String,
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
        },
        learningTime: String,
        resources: [String],
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Index for faster queries
SkillGapSchema.index({ user: 1, job: 1 });
SkillGapSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SkillGap', SkillGapSchema);
