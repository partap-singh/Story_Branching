const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate signed JWT token
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'story_branching_jwt_secret_token_key_2026',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            xp: user.xp,
            completedStories: user.completedStories,
            usedFreeRetreatStories: user.usedFreeRetreatStories
        }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists'
            });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role === 'Admin' ? 'Admin' : 'Reader',
            xp: 100,
            completedStories: [],
            usedFreeRetreatStories: []
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find user by email, explicitly including password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Account not found.'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Password incorrect.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                completedStories: user.completedStories,
                usedFreeRetreatStories: user.usedFreeRetreatStories
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update reader progression (XP, completed stories, retreats)
// @route   PUT /api/auth/progress
// @access  Private (or open for active session sync)
exports.updateProgress = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.body.userId;
        const { xp, completedStories, usedFreeRetreatStories } = req.body;

        const updateData = {};
        if (typeof xp === 'number') updateData.xp = xp;
        if (Array.isArray(completedStories)) updateData.completedStories = completedStories;
        if (Array.isArray(usedFreeRetreatStories)) updateData.usedFreeRetreatStories = usedFreeRetreatStories;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                xp: user.xp,
                completedStories: user.completedStories,
                usedFreeRetreatStories: user.usedFreeRetreatStories
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
