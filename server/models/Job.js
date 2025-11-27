const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    salary: {
        type: String,
    },
    url: {
        type: String,
        required: true,
    },
    source: {
        type: String, // 'linkedin', 'indeed', 'naukri', 'unstop'
        required: true,
        enum: ['linkedin', 'indeed', 'naukri', 'unstop', 'other'],
    },
    requiredSkills: {
        type: [String],
        default: [],
    },
    postedDate: {
        type: String,
        default: 'Recently',
    },
    matchScore: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Index for faster searches
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ location: 1, source: 1 });

module.exports = mongoose.model('Job', JobSchema);
