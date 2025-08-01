# EasyBook - Hệ thống đặt dịch vụ hoàn chỉnh

🚀 **EasyBook** là một nền tảng đặt dịch vụ hiện đại với đầy đủ tính năng từ frontend đến backend, được xây dựng với công nghệ tiên tiến và kiến trúc scalable.

## ✨ Tính năng chính

### 🎯 Core Features
- ✅ **Frontend**: Next.js (React) với SEO tối ưu, SSR/SSG
- ✅ **Backend**: Node.js + Express với kiến trúc RESTful API
- ✅ **Database**: MongoDB Atlas với seed dữ liệu tự động
- ✅ **Authentication**: JWT + Cookie session, role-based access
- ✅ **Payment**: Tích hợp đầy đủ VNPAY, Momo, PayPal
- ✅ **Email**: Gmail SMTP (xác nhận booking + nhắc lịch 24h)
- ✅ **UI/UX**: Tailwind CSS responsive, modern design
- ✅ **Admin Dashboard**: Quản lý dịch vụ, booking, thống kê
- ✅ **SEO**: Meta tags, sitemap, robots.txt, structured data

### 🔧 Technical Features
- ✅ **Auto-seed**: Tự động tạo dữ liệu mẫu khi khởi động
- ✅ **Validation**: Validate đầy đủ phía client và server
- ✅ **Error Handling**: Xử lý lỗi thông minh với fallback
- ✅ **Security**: JWT, bcrypt, CORS, rate limiting
- ✅ **Performance**: Caching, optimization, lazy loading
- ✅ **Monitoring**: Health checks, logging, metrics
- ✅ **Docker**: Containerized với docker-compose
- ✅ **CI/CD**: Ready for deployment automation

## Cấu trúc dự án

```
booking-app/
├── backend/          # Node.js + Express API
├── frontend/         # Next.js frontend
├── docker-compose.yml
└── README.md
```

## 🚀 Cài đặt và chạy

### 🐳 Cách 1: Docker (Khuyến nghị)

```bash
# Clone repository
git clone <repository-url>
cd booking-app

# Chạy script tự động (Linux/Mac)
chmod +x start.sh
./start.sh

# Hoặc chạy thủ công
docker-compose up --build
```

### 💻 Cách 2: Development Mode

```bash
# 1. Cài đặt dependencies
npm run install:all

# 2. Cấu hình environment
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Điền thông tin MongoDB Atlas, JWT secret, email, payment keys

# 3. Chạy development
npm run dev

# 4. Chạy production
npm run build
npm start
```

### 📋 Yêu cầu hệ thống

- **Node.js**: 18.x trở lên
- **Docker**: 20.x trở lên (nếu dùng Docker)
- **MongoDB**: Atlas hoặc local
- **RAM**: Tối thiểu 4GB
- **Storage**: Tối thiểu 2GB

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

### Services
- `GET /api/service` - Lấy danh sách dịch vụ
- `GET /api/service/:id` - Chi tiết dịch vụ
- `POST /api/service` - Tạo dịch vụ (admin)
- `PUT /api/service/:id` - Cập nhật dịch vụ (admin)
- `DELETE /api/service/:id` - Xóa dịch vụ (admin)

### Booking
- `POST /api/booking` - Tạo booking
- `GET /api/booking` - Lịch sử booking
- `PUT /api/booking/:id` - Cập nhật booking
- `DELETE /api/booking/:id` - Hủy booking

### Payment
- `POST /api/payment/vnpay` - Thanh toán VNPAY
- `POST /api/payment/momo` - Thanh toán Momo
- `POST /api/payment/paypal` - Thanh toán PayPal
- `GET /api/payment/callback/:method` - Callback payment

## Database Schema

### User
```js
{
  email: String,
  password: String, // đã mã hoá
  name: String,
  role: String // 'user' | 'admin'
}
```

### Service
```js
{
  name: String,
  type: String, // "stay" | "transport"
  location: String,
  price: Number,
  image: String,
  description: String,
  availableSlots: [Date]
}
```

### Booking
```js
{
  userId: ObjectId,
  serviceId: ObjectId,
  time: Date,
  status: String, // 'pending' | 'paid' | 'cancelled'
  paymentMethod: String // 'vnpay' | 'paypal' | 'momo'
}
```

## Deployment

### Docker
```bash
docker-compose up --build
```

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Railway/Heroku (Backend)
```bash
cd backend
# Deploy to your preferred platform
```

## 📊 Monitoring & Health Checks

- **Backend Health**: `http://localhost:3001/health`
- **Frontend**: `http://localhost:3000`
- **MongoDB**: `localhost:27017`
- **Docker Status**: `docker-compose ps`

## 🔧 Development Commands

```bash
# Development
npm run dev                    # Chạy cả frontend và backend
npm run dev:frontend          # Chỉ chạy frontend
npm run dev:backend           # Chỉ chạy backend

# Production
npm run build                 # Build cả frontend và backend
npm start                     # Chạy production

# Docker
docker-compose up -d          # Chạy services
docker-compose down           # Dừng services
docker-compose logs -f        # Xem logs
docker-compose restart        # Restart services

# Database
npm run seed                  # Seed database
```

## 🎯 Default Accounts

- **Admin**: `admin@easybook.com` / `admin123`
- **User**: `user1@example.com` / `user123`
- **User**: `user2@example.com` / `user123`

## 📈 Performance & Optimization

- **Frontend**: Next.js với SSR/SSG, image optimization
- **Backend**: Express với caching, compression
- **Database**: MongoDB với indexing, aggregation
- **CDN**: Ready for Cloudflare, AWS CloudFront
- **Caching**: Redis ready (có thể thêm)

## 🔒 Security Features

- **Authentication**: JWT với refresh tokens
- **Authorization**: Role-based access control
- **Validation**: Input sanitization, SQL injection prevention
- **CORS**: Configured for production
- **Rate Limiting**: Ready for implementation
- **HTTPS**: SSL/TLS ready

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
cd backend
# Deploy to your preferred platform
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Email**: support@easybook.com
- **Documentation**: [docs.easybook.com](https://docs.easybook.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 👨‍💻 Tác giả

**EasyBook Team** - 2025

Made with ❤️ for the Vietnamese community 