const natural = require('natural');

/**
 * Resume Customizer - Customizes resumes for specific jobs
 */
class ResumeCustomizer {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }

    /**
     * Customize resume for a specific job
     */
    customizeResumeForJob(baseResume, jobDescription, jobTitle) {
        try {
            const resumeSkills = baseResume.skills || [];
            const jobSkills = this.extractSkillsFromText(jobDescription);

            // Calculate match score
            const matchScore = this.calculateMatchScore(resumeSkills, jobSkills);

            // Identify relevant skills
            const relevantSkills = resumeSkills.filter(skill =>
                jobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
            );

            // Generate customized summary
            const customizedSummary = this.generateCustomizedSummary(
                baseResume,
                jobTitle,
                relevantSkills,
                matchScore
            );

            // Highlight relevant experience
            const highlightedExperience = this.highlightExperience(
                baseResume.original_text || '',
                jobSkills
            );

            return {
                summary: customizedSummary,
                skills: relevantSkills,
                highlightedExperience,
                match_score: matchScore,
                recommendations: this.generateRecommendations(resumeSkills, jobSkills),
            };
        } catch (error) {
            console.error('Error customizing resume:', error);
            throw error;
        }
    }

    /**
     * Extract skills from job description
     */
    extractSkillsFromText(text) {
        const commonSkills = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby',
            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
            'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
        ];

        const textLower = text.toLowerCase();
        return commonSkills.filter(skill => textLower.includes(skill.toLowerCase()));
    }

    /**
     * Calculate match score
     */
    calculateMatchScore(resumeSkills, jobSkills) {
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

    /**
     * Generate customized summary
     */
    generateCustomizedSummary(baseResume, jobTitle, relevantSkills, matchScore) {
        const experienceYears = baseResume.experience_years || 0;
        const topSkills = relevantSkills.slice(0, 5).join(', ');

        return `Experienced professional with ${experienceYears}+ years targeting ${jobTitle} positions. ` +
            `Proficient in ${topSkills}. ${matchScore}% skill match for this role.`;
    }

    /**
     * Highlight relevant experience
     */
    highlightExperience(text, jobSkills) {
        const sentences = text.split(/[.!?]+/);
        const relevantSentences = [];

        for (const sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            for (const skill of jobSkills) {
                if (sentenceLower.includes(skill.toLowerCase())) {
                    relevantSentences.push(sentence.trim());
                    break;
                }
            }
        }

        return relevantSentences.slice(0, 5);
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(resumeSkills, jobSkills) {
        const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
        const missingSkills = jobSkills.filter(js =>
            !resumeSkillsLower.includes(js.toLowerCase())
        );

        return missingSkills.slice(0, 3).map(skill => ({
            skill,
            action: `Consider adding ${skill} experience to your resume`,
        }));
    }
}

module.exports = ResumeCustomizer;
