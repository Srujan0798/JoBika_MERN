const {
    extractEmail,
    extractPhone,
    extractSkills,
    extractExperienceYears,
    calculateMatchScore,
} = require('../services/resumeParser');

describe('Resume Parser Service', () => {
    describe('extractEmail', () => {
        it('should extract email from text', () => {
            const text = 'Contact me at john.doe@example.com for more info';
            const email = extractEmail(text);
            expect(email).toBe('john.doe@example.com');
        });

        it('should return null if no email found', () => {
            const text = 'No email here';
            const email = extractEmail(text);
            expect(email).toBeNull();
        });
    });

    describe('extractPhone', () => {
        it('should extract phone number from text', () => {
            const text = 'Call me at (123) 456-7890';
            const phone = extractPhone(text);
            expect(phone).toBeTruthy();
        });

        it('should return null if no phone found', () => {
            const text = 'No phone number here';
            const phone = extractPhone(text);
            expect(phone).toBeNull();
        });
    });

    describe('extractSkills', () => {
        it('should extract multiple skills from text', () => {
            const text = 'I have experience with JavaScript, React, and Node.js';
            const skills = extractSkills(text);

            expect(Array.isArray(skills)).toBe(true);
            expect(skills).toContain('JavaScript');
            expect(skills).toContain('React');
            expect(skills).toContain('Node.js');
        });

        it('should not extract skills not in text', () => {
            const text = 'I only know JavaScript';
            const skills = extractSkills(text);

            expect(skills).toContain('JavaScript');
            expect(skills).not.toContain('Python');
        });

        it('should handle empty text', () => {
            const skills = extractSkills('');
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBe(0);
        });
    });

    describe('extractExperienceYears', () => {
        it('should extract years from "X years of experience" pattern', () => {
            const text = 'I have 5 years of experience in software development';
            const years = extractExperienceYears(text);
            expect(years).toBe(5);
        });

        it('should return 0 if no experience found', () => {
            const text = 'Fresh graduate looking for opportunities';
            const years = extractExperienceYears(text);
            expect(years).toBe(0);
        });
    });

    describe('calculateMatchScore', () => {
        it('should calculate 100% match for identical skills', () => {
            const resumeSkills = ['JavaScript', 'React', 'Node.js'];
            const jobSkills = ['JavaScript', 'React', 'Node.js'];
            const score = calculateMatchScore(resumeSkills, jobSkills);
            expect(score).toBe(100);
        });

        it('should calculate 50% match for half matching skills', () => {
            const resumeSkills = ['JavaScript', 'React'];
            const jobSkills = ['JavaScript', 'Python'];
            const score = calculateMatchScore(resumeSkills, jobSkills);
            expect(score).toBe(50);
        });

        it('should calculate 0% match for no matching skills', () => {
            const resumeSkills = ['JavaScript', 'React'];
            const jobSkills = ['Python', 'Django'];
            const score = calculateMatchScore(resumeSkills, jobSkills);
            expect(score).toBe(0);
        });

        it('should be case-insensitive', () => {
            const resumeSkills = ['javascript', 'react'];
            const jobSkills = ['JavaScript', 'React'];
            const score = calculateMatchScore(resumeSkills, jobSkills);
            expect(score).toBe(100);
        });

        it('should handle empty job skills', () => {
            const resumeSkills = ['JavaScript'];
            const jobSkills = [];
            const score = calculateMatchScore(resumeSkills, jobSkills);
            expect(score).toBe(0);
        });
    });
});
