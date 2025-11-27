# Contributing to JoBika

Thank you for your interest in contributing to JoBika! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB v5+
- Git

### Setup Development Environment

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/JoBika-MERN.git
cd JoBika-MERN/server
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run tests**
```bash
npm test
```

5. **Start development server**
```bash
npm run dev
```

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow our coding standards:
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Write tests for new features

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/api/auth.test.js

# Check coverage
npm run test:coverage
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Build process or tool changes

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### JavaScript Style
- Use ES6+ features
- Use `const` by default, `let` when needed
- Prefer arrow functions for callbacks
- Use async/await over promises chains
- Always use semicolons

### File Organization
```javascript
// 1. Imports
const express = require('express');
const User = require('../models/User');

// 2. Constants
const BATCH_SIZE = 100;

// 3. Helper functions
function helperFunction() { }

// 4. Main logic
function mainFunction() { }

// 5. Export
module.exports = mainFunction;
```

### Error Handling
```javascript
try {
    const result = await someAsyncOperation();
    res.json(result);
} catch (error) {
    console.error('Error in operation:', error);
    res.status(500).json({ error: error.message });
}
```

### API Responses
```javascript
// Success
res.json({ data: result, message: 'Success' });

// Error
res.status(400).json({ msg: 'Error message' });
```

## Testing Guidelines

### Writing Tests
```javascript
describe('Feature Name', () => {
    beforeEach(async () => {
        // Setup
    });

    it('should do something', async () => {
        // Arrange
        const input = { };

        // Act
        const result = await function(input);

        // Assert
        expect(result).toBeDefined();
    });
});
```

### Test Coverage
- Aim for >80% coverage
- Test happy paths and error cases
- Test edge cases
- Mock external dependencies

## Documentation

### Code Comments
```javascript
/**
 * Calculate match score between resume and job
 * @param {Array} resumeSkills - Skills from resume
 * @param {Array} jobSkills - Required skills from job
 * @returns {Number} Match score (0-100)
 */
function calculateMatch(resumeSkills, jobSkills) {
    // Implementation
}
```

### API Documentation
Add JSDoc comments for Swagger:
```javascript
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/jobs', async (req, res) => {
    // Implementation
});
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs (use logger)
- [ ] No unused variables
- [ ] Code is commented where needed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code reviewed by self
```

## Areas for Contribution

### High Priority
- [ ] Real job scraping with Puppeteer
- [ ] Advanced AI resume customization
- [ ] WebSocket for real-time notifications
- [ ] Cover letter generation
- [ ] Interview preparation module

### Medium Priority
- [ ] Redis caching implementation
- [ ] GraphQL API layer
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Browser extension

### Good First Issues
- [ ] Add more test coverage
- [ ] Improve error messages
- [ ] Add request validation
- [ ] Documentation improvements
- [ ] Bug fixes

## Questions?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [ARCHITECTURE.md](ARCHITECTURE.md)
- Open an issue for discussion

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to JoBika! 🎉
