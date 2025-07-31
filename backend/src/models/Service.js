const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Tên dịch vụ là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên dịch vụ không được quá 100 ký tự']
  },
  type: { 
    type: String, 
    enum: ['stay', 'transport'], 
    required: [true, 'Loại dịch vụ là bắt buộc']
  },
  location: { 
    type: String, 
    required: [true, 'Địa điểm là bắt buộc'],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Giá là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  image: { 
    type: String, 
    required: [true, 'Hình ảnh là bắt buộc']
  },
  description: { 
    type: String, 
    required: [true, 'Mô tả là bắt buộc'],
    maxlength: [1000, 'Mô tả không được quá 1000 ký tự']
  },
  availableSlots: [{ 
    type: Date,
    required: true
  }],
  capacity: {
    type: Number,
    default: 1,
    min: [1, 'Sức chứa phải ít nhất là 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Đánh giá không được âm'],
    max: [5, 'Đánh giá tối đa là 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    phone: String,
    email: String,
    address: String
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
serviceSchema.index({ type: 1, location: 1 });
serviceSchema.index({ isActive: 1 });

// Virtual field để tính tổng số slot còn trống
serviceSchema.virtual('availableCount').get(function() {
  const now = new Date();
  return this.availableSlots.filter(slot => slot > now).length;
});

// Method kiểm tra slot có sẵn không
serviceSchema.methods.isSlotAvailable = function(slotTime) {
  return this.availableSlots.some(slot => 
    slot.getTime() === new Date(slotTime).getTime()
  );
};

// Method lấy slots có sẵn trong tương lai
serviceSchema.methods.getAvailableSlots = function() {
  const now = new Date();
  return this.availableSlots.filter(slot => slot > now);
};

module.exports = mongoose.model('Service', serviceSchema); 