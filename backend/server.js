const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Middleware (allows requests from frontend regardless of port)
app.use(cors());

// HTTP Request Logger in development
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dynamic Story Engine API is running smoothly',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Integrated Frontend Static Serving (Option A)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback route for client-side navigation
app.get('*', (req, res, next) => {
    // If request is for an API route that was not found, return JSON 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint '${req.originalUrl}' not found`
        });
    }

    // Otherwise serve Landing.html or index.html
    res.sendFile(path.join(frontendPath, 'Landing.html'), (err) => {
        if (err) {
            res.sendFile(path.join(frontendPath, 'index.html'), next);
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Story Engine Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 Application accessible at: http://localhost:${PORT}`);
});

module.exports = { app, server };
