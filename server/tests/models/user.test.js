const User = require('../models/User');

describe('User Model', () => {
    it('should create a user successfully', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.fullName).toBe(userData.fullName);
        expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should hash password before saving', async () => {
        const user = new User({
            email: 'test@example.com',
            password: 'plaintext',
            fullName: 'Test User',
        });

        await user.save();
        expect(user.password).not.toBe('plaintext');
        expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash length
    });

    it('should not save user without required fields', async () => {
        const user = new User({ email: 'test@example.com' });

        let err;
        try {
            await user.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.name).toBe('ValidationError');
    });

    it('should not allow duplicate emails', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
        };

        await new User(userData).save();

        let err;
        try {
            await new User(userData).save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe(11000); // Duplicate key error
    });

    it('should verify password correctly', async () => {
        const user = new User({
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
        });

        await user.save();

        const isMatch = await user.matchPassword('password123');
        expect(isMatch).toBe(true);

        const isNotMatch = await user.matchPassword('wrongpassword');
        expect(isNotMatch).toBe(false);
    });

    it('should allow OAuth users without password', async () => {
        const user = new User({
            email: 'oauth@example.com',
            fullName: 'OAuth User',
            oauthProvider: 'google',
            oauthId: '12345',
        });

        const savedUser = await user.save();
        expect(savedUser._id).toBeDefined();
        expect(savedUser.oauthProvider).toBe('google');
    });
});
