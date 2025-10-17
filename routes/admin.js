// routes/admin.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const { protect, admin } = require('../middleware/auth');
const { sendStatusUpdateEmail } = require('../utils/emailService');

// Apply middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.bookingDate = { $gte: startDate, $lt: endDate };
    }

    let bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('service')
      .sort('-createdAt');

    // Search filter
    if (search) {
      bookings = bookings.filter(booking => 
        booking.user.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(search.toLowerCase()) ||
        booking.service.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/admin/bookings/:id/status
// @desc    Update booking status and send email
// @access  Private/Admin
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('service', 'name duration');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Send email notification to user
    if (oldStatus !== status) {
      await sendStatusUpdateEmail(booking, status);
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate('service');

    res.json({
      success: true,
      message: `Booking ${status} successfully. Email sent to customer.`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Total counts
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalServices = await Service.countDocuments({ isActive: true });

    // Revenue calculation
    const completedBookingsData = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookingsData.reduce((sum, b) => sum + b.totalPrice, 0);

    // This month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyCompletedBookings = await Booking.find({
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = monthlyCompletedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('service', 'name price')
      .sort('-createdAt')
      .limit(10);

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: today, $lt: tomorrow }
    });

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingBookings = await Booking.find({
      bookingDate: { $gte: today, $lte: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('user', 'name')
    .populate('service', 'name')
    .sort('bookingDate');

    res.json({
      statistics: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalUsers,
        totalServices,
        totalRevenue,
        monthlyRevenue,
        todayBookings
      },
      recentBookings,
      upcomingBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/services/all
// @desc    Get all services (including inactive)
// @access  Private/Admin
router.get('/services/all', async (req, res) => {
  try {
    const services = await Service.find().sort('-createdAt');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/services/:id
// @desc    Update service
// @access  Private/Admin
router.put('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Delete service (soft delete)
// @access  Private/Admin
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isActive = false;
    await service.save();

    res.json({ 
      success: true,
      message: 'Service deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete booking permanently
// @access  Private/Admin
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;