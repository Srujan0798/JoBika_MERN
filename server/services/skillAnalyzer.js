/**
 * Skill Gap Analyzer - Analyzes skill gaps between user and job requirements
 */
class SkillGapAnalyzer {
    /**
     * Analyze skill gap
     */
    analyzeSkillGap(userSkills, jobSkills, jobTitle) {
        const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
        const jobSkillsLower = (jobSkills || []).map(s => s.toLowerCase());

        // Identify matching and missing skills
        const matchingSkills = jobSkills.filter(skill =>
            userSkillsLower.includes(skill.toLowerCase())
        );

        const missingSkills = jobSkills.filter(skill =>
            !userSkillsLower.includes(skill.toLowerCase())
        );

        // Calculate match score
        const matchScore = jobSkills.length > 0
            ? Math.round((matchingSkills.length / jobSkills.length) * 100)
            : 0;

        // Generate recommendations
        const recommendations = this.generateRecommendations(missingSkills, jobTitle);

        return {
            matching_skills: matchingSkills,
            missing_skills: missingSkills,
            match_score: matchScore,
            recommendations,
        };
    }

    /**
     * Generate learning recommendations
     */
    generateRecommendations(missingSkills, jobTitle) {
        const learningResources = {
            'JavaScript': {
                priority: 'high',
                learningTime: '2-3 months',
                resources: [
                    'https://javascript.info',
                    'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures',
                    'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
                ],
            },
            'Python': {
                priority: 'high',
                learningTime: '2-3 months',
                resources: [
                    'https://www.python.org/about/gettingstarted/',
                    'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
                    'https://docs.python.org/3/tutorial/'
                ],
            },
            'React': {
                priority: 'high',
                learningTime: '1-2 months',
                resources: [
                    'https://react.dev/learn',
                    'https://www.freecodecamp.org/learn/front-end-development-libraries',
                    'https://egghead.io/courses/the-beginner-s-guide-to-react'
                ],
            },
            'Node.js': {
                priority: 'high',
                learningTime: '1-2 months',
                resources: [
                    'https://nodejs.org/en/docs/guides/',
                    'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
                    'https://nodeschool.io/'
                ],
            },
            'AWS': {
                priority: 'medium',
                learningTime: '2-4 months',
                resources: [
                    'https://aws.amazon.com/training/digital/',
                    'https://www.freecodecamp.org/news/tag/aws/',
                    'https://cloudacademy.com/library/amazon-web-services/'
                ],
            },
            'Docker': {
                priority: 'medium',
                learningTime: '1 month',
                resources: [
                    'https://docs.docker.com/get-started/',
                    'https://www.freecodecamp.org/news/the-docker-handbook/',
                    'https://docker-curriculum.com/'
                ],
            },
        };

        const recommendations = [];
        for (const skill of missingSkills) {
            const resource = learningResources[skill] || {
                priority: 'low',
                learningTime: '1-2 months',
                resources: [
                    `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}`,
                    `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}`,
                ],
            };

            recommendations.push({
                skill,
                ...resource,
            });
        }

        // Sort by priority
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations;
    }
}

module.exports = SkillGapAnalyzer;
