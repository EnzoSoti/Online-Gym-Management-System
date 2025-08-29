const express = require('express');
const router = express.Router();

// Import all route modules
const supplementsRoutes = require('./supplements');
const buySupplementsRoutes = require('./buySupplements');
const monthlyMembersRoutes = require('./monthlyMembers');
const checkInsRoutes = require('./checkIns');
const reservationsRoutes = require('./reservations');
const adminRoutes = require('./admin');
const salesReportsRoutes = require('./salesReports');
const dashboardRoutes = require('./dashboard');
const authRoutes = require('./auth');
const feedbackRoutes = require('./feedback');

// Mount all routes
router.use('/api/supplements', supplementsRoutes);
router.use('/api/buy-supplement', buySupplementsRoutes);
router.use('/api/monthly-members', monthlyMembersRoutes);
router.use('/api/check-ins', checkInsRoutes);
router.use('/api/reservations', reservationsRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/sales-reports', salesReportsRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', authRoutes);
router.use('/api/feedback', feedbackRoutes);

module.exports = router;