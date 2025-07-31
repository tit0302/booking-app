const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const User = require('../../models/User');
const { authenticateToken, requireAdmin, requireOwnership } = require('../../middleware/auth');
const { sendBookingConfirmation } = require('../../utils/email');

const router = express.Router();

// Middleware xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules cho booking
const bookingValidation = [
  body('serviceId')
    .isMongoId()
    .withMessage('Service ID không hợp lệ'),
  body('time')
    .isISO8601()
    .withMessage('Thời gian phải là định dạng ISO 8601'),
  body('paymentMethod')
    .isIn(['vnpay', 'paypal', 'momo', 'cash'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  body('amount')
    .isNumeric()
    .withMessage('Số tiền phải là số')
    .isFloat({ min: 0 })
    .withMessage('Số tiền không được âm'),
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên khách hàng phải có từ 2-50 ký tự'),
  body('customerInfo.phone')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('customerInfo.note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được quá 500 ký tự')
];

// POST /api/booking - Tạo booking mới
router.post('/', authenticateToken, bookingValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      serviceId,
      time,
      paymentMethod,
      amount,
      customerInfo
    } = req.body;

    // Kiểm tra service có tồn tại không
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Kiểm tra service có active không
    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Dịch vụ không khả dụng'
      });
    }

    // Kiểm tra slot có sẵn không
    const bookingTime = new Date(time);
    if (!service.isSlotAvailable(bookingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian đã được đặt hoặc không khả dụng'
      });
    }

    // Kiểm tra booking trùng lặp
    const existingBooking = await Booking.findOne({
      serviceId,
      time: bookingTime,
      status: { $in: ['pending', 'paid'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian này đã được đặt'
      });
    }

    // Tạo booking mới
    const booking = new Booking({
      userId: req.user._id,
      serviceId,
      time: bookingTime,
      paymentMethod,
      amount,
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        note: customerInfo.note || ''
      }
    });

    await booking.save();

    // Xóa slot đã đặt khỏi available slots
    service.availableSlots = service.availableSlots.filter(
      slot => slot.getTime() !== bookingTime.getTime()
    );
    await service.save();

    // Gửi email xác nhận
    try {
      await sendBookingConfirmation(booking, service, req.user);
    } catch (emailError) {
      console.error('Lỗi gửi email xác nhận:', emailError);
      // Không throw error vì booking đã tạo thành công
    }

    res.status(201).json({
      success: true,
      message: 'Đặt dịch vụ thành công',
      data: { booking }
    });

  } catch (error) {
    console.error('Lỗi tạo booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/booking - Lấy danh sách booking
router.get('/', authenticateToken, [
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'cancelled', 'completed'])
    .withMessage('Trạng thái không hợp lệ'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Giới hạn phải từ 1-50')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Xây dựng filter
    const filter = {};
    
    // Admin có thể xem tất cả, user chỉ xem của mình
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    
    if (status) filter.status = status;

    // Xây dựng sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query
    const bookings = await Booking.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('serviceId', 'name type location price image')
      .populate('userId', 'name email');

    // Đếm tổng số
    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/booking/:id - Lấy chi tiết booking
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Lỗi lấy chi tiết booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// PUT /api/booking/:id - Cập nhật booking
router.put('/:id', authenticateToken, [
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'cancelled', 'completed'])
    .withMessage('Trạng thái không hợp lệ'),
  body('adminNote')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Ghi chú admin không được quá 500 ký tự')
], handleValidationErrors, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật'
      });
    }

    // Cập nhật booking
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.adminNote && req.user.role === 'admin') {
      updateData.adminNote = req.body.adminNote;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('serviceId').populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Cập nhật booking thành công',
      data: { booking: updatedBooking }
    });

  } catch (error) {
    console.error('Lỗi cập nhật booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// DELETE /api/booking/:id - Hủy booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra quyền hủy
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy booking'
      });
    }

    // Kiểm tra có thể hủy không
    if (!booking.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy booking này (ít nhất 2 giờ trước)'
      });
    }

    // Cập nhật trạng thái thành cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Thêm lại slot vào available slots
    const service = await Service.findById(booking.serviceId);
    if (service) {
      service.availableSlots.push(booking.time);
      await service.save();
    }

    res.json({
      success: true,
      message: 'Hủy booking thành công'
    });

  } catch (error) {
    console.error('Lỗi hủy booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/booking/stats - Thống kê booking (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Thống kê tổng quan
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const paidBookings = await Booking.countDocuments({ status: 'paid' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Thống kê theo tháng
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Tổng doanh thu
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Thống kê theo loại dịch vụ
    const serviceStats = await Booking.aggregate([
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $group: { _id: '$service.type', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalBookings,
          pending: pendingBookings,
          paid: paidBookings,
          cancelled: cancelledBookings,
          completed: completedBookings,
          monthly: monthlyBookings,
          revenue: totalRevenue[0]?.total || 0
        },
        serviceStats
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 