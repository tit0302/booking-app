const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');

// Tạo dữ liệu mẫu cho services
const sampleServices = [
  {
    name: 'Homestay Đà Lạt View',
    type: 'stay',
    location: 'Đà Lạt, Lâm Đồng',
    price: 800000,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    description: 'Homestay đẹp với view núi rừng Đà Lạt, phòng ấm cúng với đầy đủ tiện nghi. Phù hợp cho các cặp đôi hoặc gia đình nhỏ.',
    capacity: 4,
    rating: 4.5,
    reviewCount: 12,
    amenities: ['WiFi', 'Bếp riêng', 'Ban công', 'Máy sưởi', 'Bãi đỗ xe'],
    contactInfo: {
      phone: '0901234567',
      email: 'homestay@dalat.com',
      address: '123 Đường Nguyễn Văn Linh, Đà Lạt'
    }
  },
  {
    name: 'Resort Nha Trang Beach',
    type: 'stay',
    location: 'Nha Trang, Khánh Hòa',
    price: 2500000,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    description: 'Resort 5 sao ngay bên bờ biển Nha Trang với hồ bơi vô cực, spa và nhà hàng sang trọng. Dịch vụ đẳng cấp quốc tế.',
    capacity: 6,
    rating: 4.8,
    reviewCount: 25,
    amenities: ['Hồ bơi', 'Spa', 'Nhà hàng', 'Gym', 'Bãi biển riêng', 'WiFi', 'TV 4K'],
    contactInfo: {
      phone: '0901234568',
      email: 'resort@nhatrang.com',
      address: '456 Đường Trần Phú, Nha Trang'
    }
  },
  {
    name: 'Xe Dịch Vụ Sài Gòn Premium',
    type: 'transport',
    location: 'TP.HCM',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800',
    description: 'Xe dịch vụ 7 chỗ cao cấp với tài xế chuyên nghiệp, phục vụ di chuyển trong và ngoài thành phố. An toàn, tiện nghi.',
    capacity: 7,
    rating: 4.6,
    reviewCount: 18,
    amenities: ['Điều hòa', 'WiFi', 'Nước uống', 'Tài xế chuyên nghiệp', 'Bảo hiểm'],
    contactInfo: {
      phone: '0901234569',
      email: 'transport@saigon.com',
      address: '789 Đường Lê Lợi, Quận 1, TP.HCM'
    }
  },
  {
    name: 'Xe Limousine Đà Nẵng',
    type: 'transport',
    location: 'Đà Nẵng',
    price: 1800000,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    description: 'Xe Limousine sang trọng phục vụ đưa đón sân bay, du lịch Đà Nẵng. Nội thất cao cấp, dịch vụ VIP.',
    capacity: 4,
    rating: 4.7,
    reviewCount: 15,
    amenities: ['Nội thất cao cấp', 'WiFi', 'Mini bar', 'Tài xế VIP', 'Bảo hiểm cao cấp'],
    contactInfo: {
      phone: '0901234570',
      email: 'limo@danang.com',
      address: '321 Đường Bạch Đằng, Đà Nẵng'
    }
  },
  {
    name: 'Villa Phú Quốc Ocean View',
    type: 'stay',
    location: 'Phú Quốc, Kiên Giang',
    price: 3500000,
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
    description: 'Villa riêng biệt với view biển tuyệt đẹp tại Phú Quốc. Hồ bơi riêng, bếp đầy đủ, phù hợp cho gia đình lớn.',
    capacity: 8,
    rating: 4.9,
    reviewCount: 8,
    amenities: ['Hồ bơi riêng', 'Bếp đầy đủ', 'Ban công rộng', 'Bãi biển riêng', 'WiFi', 'TV 4K'],
    contactInfo: {
      phone: '0901234571',
      email: 'villa@phuquoc.com',
      address: '654 Đường Trần Hưng Đạo, Phú Quốc'
    }
  }
];

// Tạo dữ liệu mẫu cho users
const sampleUsers = [
  {
    email: 'admin@easybook.com',
    password: 'admin123',
    name: 'Admin EasyBook',
    role: 'admin',
    phone: '0901234567'
  },
  {
    email: 'user1@example.com',
    password: 'user123',
    name: 'Nguyễn Văn A',
    role: 'user',
    phone: '0901234568'
  },
  {
    email: 'user2@example.com',
    password: 'user123',
    name: 'Trần Thị B',
    role: 'user',
    phone: '0901234569'
  }
];

// Tạo available slots cho các dịch vụ
function generateAvailableSlots() {
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
  
  return slots;
}

// Hàm seed chính
async function seedDatabase() {
  try {
    console.log('🔄 Bắt đầu seed database...');
    
    // Kiểm tra và tạo users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📝 Tạo users mẫu...');
      for (const userData of sampleUsers) {
        const user = new User(userData);
        await user.save();
      }
      console.log(`✅ Đã tạo ${sampleUsers.length} users mẫu`);
    } else {
      console.log(`ℹ️ Đã có ${userCount} users trong database`);
    }
    
    // Kiểm tra và tạo services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('📝 Tạo services mẫu...');
      for (const serviceData of sampleServices) {
        const service = new Service({
          ...serviceData,
          availableSlots: generateAvailableSlots()
        });
        await service.save();
      }
      console.log(`✅ Đã tạo ${sampleServices.length} services mẫu`);
    } else {
      console.log(`ℹ️ Đã có ${serviceCount} services trong database`);
    }
    
    // Tạo một số bookings mẫu
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      console.log('📝 Tạo bookings mẫu...');
      
      const users = await User.find({ role: 'user' });
      const services = await Service.find();
      
      if (users.length > 0 && services.length > 0) {
        const sampleBookings = [
          {
            userId: users[0]._id,
            serviceId: services[0]._id,
            time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 ngày tới
            status: 'paid',
            paymentMethod: 'vnpay',
            amount: services[0].price,
            paymentStatus: 'paid',
            customerInfo: {
              name: users[0].name,
              phone: users[0].phone || '0901234567',
              email: users[0].email,
              note: 'Booking mẫu'
            }
          },
          {
            userId: users[0]._id,
            serviceId: services[1]._id,
            time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 ngày tới
            status: 'pending',
            paymentMethod: 'momo',
            amount: services[1].price,
            paymentStatus: 'pending',
            customerInfo: {
              name: users[0].name,
              phone: users[0].phone || '0901234567',
              email: users[0].email,
              note: 'Booking chờ thanh toán'
            }
          }
        ];
        
        for (const bookingData of sampleBookings) {
          const booking = new Booking(bookingData);
          await booking.save();
        }
        console.log(`✅ Đã tạo ${sampleBookings.length} bookings mẫu`);
      }
    } else {
      console.log(`ℹ️ Đã có ${bookingCount} bookings trong database`);
    }
    
    console.log('🎉 Seed database hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
    throw error;
  }
}

// Export để sử dụng trong index.js
module.exports = seedDatabase;

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('🔗 Kết nối MongoDB thành công!');
    return seedDatabase();
  })
  .then(() => {
    console.log('✅ Seed hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
} 