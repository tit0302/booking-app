require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

// Import routes
const authRoutes = require('./api/auth');
const serviceRoutes = require('./api/service');
const bookingRoutes = require('./api/booking');
const paymentRoutes = require('./api/payment');

// Import utilities
const seedDatabase = require('./seed/seed');
const { sendBookingReminder } = require('./utils/email');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server đang hoạt động',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// Cron job để gửi email nhắc lịch (chạy mỗi giờ)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Chạy cron job gửi email nhắc lịch...');
    
    const Booking = require('./models/Booking');
    const Service = require('./models/Service');
    const User = require('./models/User');
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Tìm các booking vào ngày mai chưa gửi nhắc lịch
    const bookings = await Booking.find({
      time: {
        $gte: new Date(tomorrow.getTime() - 60 * 60 * 1000), // 1 giờ trước
        $lte: new Date(tomorrow.getTime() + 60 * 60 * 1000)  // 1 giờ sau
      },
      status: { $in: ['pending', 'paid'] },
      isReminderSent: false
    }).populate('serviceId').populate('userId');
    
    for (const booking of bookings) {
      try {
        await sendBookingReminder(booking, booking.serviceId, booking.userId);
        
        // Đánh dấu đã gửi nhắc lịch
        booking.isReminderSent = true;
        booking.reminderSentAt = new Date();
        await booking.save();
        
        console.log(`✅ Đã gửi email nhắc lịch cho booking ${booking._id}`);
      } catch (error) {
        console.error(`❌ Lỗi gửi email nhắc lịch cho booking ${booking._id}:`, error);
      }
    }
    
    console.log(`📧 Đã xử lý ${bookings.length} email nhắc lịch`);
    
  } catch (error) {
    console.error('❌ Lỗi cron job gửi email nhắc lịch:', error);
  }
});

// Middleware xử lý lỗi 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

// Middleware xử lý lỗi tổng
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err);
  
  // Xử lý lỗi validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }
  
  // Xử lý lỗi MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }
  
  // Xử lý lỗi duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} đã tồn tại`
    });
  }
  
  // Xử lý lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn'
    });
  }
  
  // Lỗi mặc định
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Lỗi server' 
      : err.message
  });
});

// Kết nối MongoDB và khởi động server
const startServer = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Seed database nếu cần
    await seedDatabase();
    
    // Khởi động server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
};

// Xử lý graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Nhận tín hiệu SIGTERM, đang tắt server...');
  mongoose.connection.close(() => {
    console.log('✅ Đã đóng kết nối MongoDB');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Nhận tín hiệu SIGINT, đang tắt server...');
  mongoose.connection.close(() => {
    console.log('✅ Đã đóng kết nối MongoDB');
    process.exit(0);
  });
});

// Xử lý unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Khởi động server
startServer(); 