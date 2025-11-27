const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    parsedContent: {
        type: String, // Extracted text from PDF/DOCX
    },
    enhancedText: {
        type: String, // AI-enhanced version
    },
    skills: {
        type: [String],
        default: [],
    },
    experienceYears: {
        type: Number,
        default: 0,
    },
    extractedInfo: {
        name: String,
        email: String,
        phone: String,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
