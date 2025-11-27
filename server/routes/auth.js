const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const passport = require('passport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendWelcomeEmail } = require('../services/emailService');

// Helper to create notification
async function createNotification(userId, title, message, type = 'info') {
    try {
        const notification = new Notification({
            user: userId,
            title,
            message,
            type,
        });
        await notification.save();
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName, phone } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password,
            fullName,
            phone,
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' },
            async (err, token) => {
                if (err) throw err;

                // Send welcome email
                try {
                    await sendWelcomeEmail(email, fullName);

                    // Create welcome notification
                    await createNotification(
                        user.id,
                        'Welcome to JoBika!',
                        'Your account has been successfully created. Start by uploading your resume.',
                        'success'
                    );
                } catch (error) {
                    console.error('Error sending welcome email:', error);
                }

                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        phone: user.phone,
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password, twoFactorCode } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled) {
            if (!twoFactorCode) {
                return res.status(200).json({
                    require2fa: true,
                    email: email
                });
            }

            // Verify 2FA code
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });

            if (!verified) {
                return res.status(401).json({ msg: 'Invalid 2FA code' });
            }
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        phone: user.phone,
                        isTwoFactorEnabled: user.isTwoFactorEnabled,
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 2FA Setup
router.post('/2fa/setup', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate 2FA secret
        const secret = speakeasy.generateSecret({
            name: `JoBika (${user.email})`,
        });

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Save secret (not enabled yet)
        user.twoFactorSecret = secret.base32;
        await user.save();

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 2FA Verify and Enable
router.post('/2fa/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { code } = req.body;
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });

        if (!verified) {
            return res.status(400).json({ msg: 'Invalid code' });
        }

        // Enable 2FA
        user.isTwoFactorEnabled = true;
        await user.save();

        await createNotification(
            user.id,
            '2FA Enabled',
            'Two-factor authentication has been enabled on your account.',
            'success'
        );

        res.json({ msg: '2FA enabled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 2FA Disable
router.post('/2fa/disable', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { password } = req.body;
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid password' });
        }

        // Disable 2FA
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        await createNotification(
            user.id,
            '2FA Disabled',
            'Two-factor authentication has been disabled on your account.',
            'warning'
        );

        res.json({ msg: '2FA disabled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// OAuth routes placeholder (requires passport configuration)
// TODO: Setup passport strategies in a separate config file
router.get('/oauth/:provider', (req, res) => {
    res.status(501).json({ msg: 'OAuth not yet configured. Setup passport strategies first.' });
});

module.exports = router;
