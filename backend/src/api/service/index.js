const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Service = require('../../models/Service');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

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

// Validation rules cho service
const serviceValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên dịch vụ phải có từ 2-100 ký tự'),
  body('type')
    .isIn(['stay', 'transport'])
    .withMessage('Loại dịch vụ phải là stay hoặc transport'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Địa điểm là bắt buộc'),
  body('price')
    .isNumeric()
    .withMessage('Giá phải là số')
    .isFloat({ min: 0 })
    .withMessage('Giá không được âm'),
  body('image')
    .isURL()
    .withMessage('Hình ảnh phải là URL hợp lệ'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mô tả phải có từ 10-1000 ký tự'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sức chứa phải là số nguyên dương'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Tiện nghi phải là mảng'),
  body('contactInfo.phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
];

// GET /api/service - Lấy danh sách dịch vụ
router.get('/', [
  query('type')
    .optional()
    .isIn(['stay', 'transport'])
    .withMessage('Loại dịch vụ không hợp lệ'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Địa điểm không hợp lệ'),
  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Giá tối thiểu phải là số'),
  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Giá tối đa phải là số'),
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
      type,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Xây dựng filter
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Xây dựng sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query
    const services = await Service.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('contactInfo');

    // Đếm tổng số
    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách dịch vụ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/service/:id - Lấy chi tiết dịch vụ
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('contactInfo');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Lấy available slots trong tương lai
    const availableSlots = service.getAvailableSlots();

    res.json({
      success: true,
      data: {
        service: {
          ...service.toJSON(),
          availableSlots
        }
      }
    });

  } catch (error) {
    console.error('Lỗi lấy chi tiết dịch vụ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/service - Tạo dịch vụ mới (admin only)
router.post('/', authenticateToken, requireAdmin, serviceValidation, handleValidationErrors, async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Tạo available slots mặc định
    if (!serviceData.availableSlots) {
      const slots = [];
      const now = new Date();
      
      // Tạo slots cho 30 ngày tới
      for (let i = 1; i <= 30; i++) {
        const date = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
        
        // Tạo 3 slots mỗi ngày: 9h, 14h, 19h
        const times = [9, 14, 19];
        times.forEach(hour => {
          const slot = new Date(date);
          slot.setHours(hour, 0, 0, 0);
          slots.push(slot);
        });
      }
      
      serviceData.availableSlots = slots;
    }

    const service = new Service(serviceData);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: { service }
    });

  } catch (error) {
    console.error('Lỗi tạo dịch vụ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// PUT /api/service/:id - Cập nhật dịch vụ (admin only)
router.put('/:id', authenticateToken, requireAdmin, serviceValidation, handleValidationErrors, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: { service: updatedService }
    });

  } catch (error) {
    console.error('Lỗi cập nhật dịch vụ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// DELETE /api/service/:id - Xóa dịch vụ (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Soft delete - chỉ đánh dấu không active
    service.isActive = false;
    await service.save();

    res.json({
      success: true,
      message: 'Xóa dịch vụ thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa dịch vụ:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/service/:id/slots - Lấy available slots của dịch vụ
router.get('/:id/slots', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    const availableSlots = service.getAvailableSlots();

    res.json({
      success: true,
      data: {
        slots: availableSlots,
        count: availableSlots.length
      }
    });

  } catch (error) {
    console.error('Lỗi lấy available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/service/:id/slots - Thêm available slots (admin only)
router.post('/:id/slots', authenticateToken, requireAdmin, [
  body('slots')
    .isArray()
    .withMessage('Slots phải là mảng'),
  body('slots.*')
    .isISO8601()
    .withMessage('Thời gian slot phải là định dạng ISO 8601')
], handleValidationErrors, async (req, res) => {
  try {
    const { slots } = req.body;
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Thêm slots mới
    const newSlots = slots.map(slot => new Date(slot));
    service.availableSlots.push(...newSlots);
    await service.save();

    res.json({
      success: true,
      message: 'Thêm slots thành công',
      data: {
        addedSlots: newSlots.length,
        totalSlots: service.availableSlots.length
      }
    });

  } catch (error) {
    console.error('Lỗi thêm slots:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 