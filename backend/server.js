const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { testConnection } = require('./db');
const reviewsRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/reviews', reviewsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Hostel Mess Reviews & Quality Analytics API'
    });
});

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log(`🚀 Server running on port ${PORT}`);
        await testConnection();
    });
}

module.exports = app;
