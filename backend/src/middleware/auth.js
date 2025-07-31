const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Lấy token từ cookie hoặc header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không tìm thấy token xác thực' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm user trong database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    // Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản đã bị khóa' 
      });
    }

    // Thêm user vào request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực' 
    });
  }
};

// Middleware kiểm tra role admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Cần đăng nhập' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
  }
  
  next();
};

// Middleware kiểm tra quyền sở hữu (user chỉ có thể thao tác với dữ liệu của mình)
const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Cần đăng nhập' 
    });
  }
  
  // Admin có thể thao tác với tất cả
  if (req.user.role === 'admin') {
    return next();
  }
  
  // User chỉ có thể thao tác với dữ liệu của mình
  const resourceUserId = req.params.userId || req.body.userId;
  if (resourceUserId && resourceUserId !== req.user._id.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: 'Không có quyền truy cập' 
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership
}; 