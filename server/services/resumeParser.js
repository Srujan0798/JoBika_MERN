const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const natural = require('natural');

/**
 * Parse PDF file and extract text
 */
async function parsePDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF file');
    }
}

/**
 * Parse DOCX file and extract text
 */
async function parseDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error('Failed to parse DOCX file');
    }
}

/**
 * Extract email from text using regex
 */
function extractEmail(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
    const phoneRegex = /(?:\+?(\d{1,3}))?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : null;
}

/**
 * Extract name from text (simple heuristic - first line or first capitalized words)
 */
function extractName(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Check if first line looks like a name (2-4 words, all capitalized)
        const words = firstLine.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
            const allCapitalized = words.every(word => /^[A-Z]/.test(word));
            if (allCapitalized) {
                return firstLine;
            }
        }
    }
    return null;
}

/**
 * Extract skills from text
 */
function extractSkills(text) {
    const commonSkills = [
        // Programming Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust',
        'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C',

        // Web Technologies
        'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js', 'Nuxt.js',
        'jQuery', 'Bootstrap', 'Tailwind', 'SASS', 'LESS', 'Webpack', 'Vite',

        // Backend & Databases
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra',
        'DynamoDB', 'Firebase', 'Supabase', 'GraphQL', 'REST API', 'gRPC',

        // Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Git', 'GitHub',
        'GitLab', 'Terraform', 'Ansible', 'Linux', 'Nginx', 'Apache',

        // Data Science & ML
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        'Pandas', 'NumPy', 'Data Analysis', 'Statistics', 'AI',

        // Mobile
        'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin',

        // Other
        'Agile', 'Scrum', 'JIRA', 'Figma', 'Adobe XD', 'Photoshop', 'Testing',
        'Jest', 'Mocha', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing'
    ];

    const foundSkills = [];
    const textLower = text.toLowerCase();

    for (const skill of commonSkills) {
        const skillLower = skill.toLowerCase();
        if (textLower.includes(skillLower)) {
            foundSkills.push(skill);
        }
    }

    return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Extract years of experience from text
 */
function extractExperienceYears(text) {
    // Look for patterns like "5 years", "2-3 years", "5+ years"
    const patterns = [
        /(\d+)\+?\s*years?\s*of\s*experience/gi,
        /(\d+)\s*years?\s*experience/gi,
        /experience\s*:?\s*(\d+)\+?\s*years?/gi,
    ];

    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
            const numbers = matches[0].match(/\d+/);
            if (numbers) {
                return parseInt(numbers[0]);
            }
        }
    }

    // Count occurrences of year ranges (e.g., 2020-2022)
    const yearRangePattern = /20\d{2}\s*[-–]\s*(?:20\d{2}|present|current)/gi;
    const yearRanges = text.match(yearRangePattern);
    if (yearRanges && yearRanges.length > 0) {
        return yearRanges.length; // Rough estimate based on job counts
    }

    return 0;
}

/**
 * Enhance resume text (basic implementation - placeholder for AI enhancement)
 */
function enhanceResumeText(text) {
    // Simple enhancement: clean up whitespace, format better
    let enhanced = text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n')  // Clean up multiple newlines
        .trim();

    // In production, this could call an AI service for enhancement
    return enhanced;
}

/**
 * Calculate match score between resume and job
 */
function calculateMatchScore(resumeSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 0;

    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    let matchCount = 0;
    for (const skill of jobSkillsLower) {
        if (resumeSkillsLower.includes(skill)) {
            matchCount++;
        }
    }

    return Math.round((matchCount / jobSkills.length) * 100);
}

module.exports = {
    parsePDF,
    parseDOCX,
    extractEmail,
    extractPhone,
    extractName,
    extractSkills,
    extractExperienceYears,
    enhanceResumeText,
    calculateMatchScore,
};
