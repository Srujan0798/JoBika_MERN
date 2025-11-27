module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        'models/**/*.js',
        'routes/**/*.js',
        'services/**/*.js',
        'middleware/**/*.js',
    ],
};
