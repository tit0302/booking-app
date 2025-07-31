const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: [true, 'Service ID là bắt buộc']
  },
  time: { 
    type: Date, 
    required: [true, 'Thời gian booking là bắt buộc']
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled', 'completed'], 
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    enum: ['vnpay', 'paypal', 'momo', 'cash'], 
    required: [true, 'Phương thức thanh toán là bắt buộc']
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không được âm']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Tên khách hàng là bắt buộc']
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc']
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc']
    },
    note: {
      type: String,
      maxlength: [500, 'Ghi chú không được quá 500 ký tự']
    }
  },
  adminNote: {
    type: String,
    maxlength: [500, 'Ghi chú admin không được quá 500 ký tự']
  },
  isReminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ serviceId: 1, time: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual field để tính trạng thái booking
bookingSchema.virtual('isExpired').get(function() {
  return this.time < new Date() && this.status === 'pending';
});

// Virtual field để tính thời gian còn lại
bookingSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.time.getTime() - now.getTime();
  return timeDiff > 0 ? timeDiff : 0;
});

// Method kiểm tra có thể hủy booking không
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const timeDiff = this.time.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Có thể hủy nếu còn ít nhất 2 giờ trước booking
  return this.status === 'pending' && hoursDiff >= 2;
};

// Method cập nhật trạng thái booking
bookingSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'paid') {
    this.paymentStatus = 'paid';
  }
  return this.save();
};

// Middleware tự động cập nhật trạng thái khi booking hết hạn
bookingSchema.pre('save', function(next) {
  if (this.isModified('time') || this.isModified('status')) {
    const now = new Date();
    if (this.time < now && this.status === 'pending') {
      this.status = 'cancelled';
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 