const SkillGapAnalyzer = require('../services/skillAnalyzer');

describe('Skill Gap Analyzer Service', () => {
    let analyzer;

    beforeEach(() => {
        analyzer = new SkillGapAnalyzer();
    });

    describe('analyzeSkillGap', () => {
        it('should identify matching skills', () => {
            const userSkills = ['JavaScript', 'React', 'Node.js'];
            const jobSkills = ['JavaScript', 'React', 'Python'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.matching_skills).toContain('JavaScript');
            expect(result.matching_skills).toContain('React');
            expect(result.matching_skills.length).toBe(2);
        });

        it('should identify missing skills', () => {
            const userSkills = ['JavaScript', 'React'];
            const jobSkills = ['JavaScript', 'React', 'Python', 'Docker'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.missing_skills).toContain('Python');
            expect(result.missing_skills).toContain('Docker');
            expect(result.missing_skills.length).toBe(2);
        });

        it('should calculate match score correctly', () => {
            const userSkills = ['JavaScript', 'React'];
            const jobSkills = ['JavaScript', 'React', 'Python', 'Docker'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.match_score).toBe(50); // 2 out of 4 skills
        });

        it('should provide recommendations for missing skills', () => {
            const userSkills = ['JavaScript'];
            const jobSkills = ['JavaScript', 'Python', 'React'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it('should handle 100% match', () => {
            const userSkills = ['JavaScript', 'Python', 'React'];
            const jobSkills = ['JavaScript', 'Python', 'React'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.match_score).toBe(100);
            expect(result.missing_skills.length).toBe(0);
        });

        it('should handle 0% match', () => {
            const userSkills = ['Java', 'Spring'];
            const jobSkills = ['Python', 'Django'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.match_score).toBe(0);
            expect(result.matching_skills.length).toBe(0);
        });

        it('should be case-insensitive', () => {
            const userSkills = ['javascript', 'react'];
            const jobSkills = ['JavaScript', 'React'];

            const result = analyzer.analyzeSkillGap(userSkills, jobSkills, 'Software Engineer');

            expect(result.match_score).toBe(100);
        });
    });

    describe('generateRecommendations', () => {
        it('should prioritize high priority skills', () => {
            const missingSkills = ['JavaScript', 'AWS', 'Python'];

            const recommendations = analyzer.generateRecommendations(missingSkills, 'Software Engineer');

            const highPriority = recommendations.filter(r => r.priority === 'high');
            expect(highPriority.length).toBeGreaterThan(0);
        });

        it('should include learning resources', () => {
            const missingSkills = ['JavaScript'];

            const recommendations = analyzer.generateRecommendations(missingSkills, 'Software Engineer');

            expect(recommendations[0]).toHaveProperty('resources');
            expect(Array.isArray(recommendations[0].resources)).toBe(true);
            expect(recommendations[0].resources.length).toBeGreaterThan(0);
        });

        it('should include learning time estimates', () => {
            const missingSkills = ['React'];

            const recommendations = analyzer.generateRecommendations(missingSkills, 'Software Engineer');

            expect(recommendations[0]).toHaveProperty('learningTime');
            expect(typeof recommendations[0].learningTime).toBe('string');
        });
    });
});
