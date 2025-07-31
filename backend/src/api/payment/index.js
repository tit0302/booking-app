const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const { authenticateToken } = require('../../middleware/auth');

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

// Validation rules cho payment
const paymentValidation = [
  body('bookingId')
    .isMongoId()
    .withMessage('Booking ID không hợp lệ'),
  body('paymentMethod')
    .isIn(['vnpay', 'paypal', 'momo'])
    .withMessage('Phương thức thanh toán không hợp lệ')
];

// Tạo VNPAY payment URL
const createVNPayUrl = (booking, returnUrl) => {
  const date = new Date();
  const createDate = date.toISOString().split('T')[0].split('-').join('');
  
  const tmnCode = process.env.VN_PAY_TMN_CODE;
  const secretKey = process.env.VN_PAY_SECRET;
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  
  const orderId = `booking_${booking._id}_${Date.now()}`;
  const amount = booking.amount * 100; // VNPAY tính bằng xu
  
  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount,
    vnp_CurrCode: 'VND',
    vnp_BankCode: '',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan booking ${booking._id}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate
  };
  
  // Sắp xếp params theo thứ tự alphabet
  const sortedParams = Object.keys(vnpParams).sort().reduce((result, key) => {
    result[key] = vnpParams[key];
    return result;
  }, {});
  
  // Tạo query string
  const queryString = Object.keys(sortedParams)
    .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');
  
  // Tạo signature
  const signData = queryString;
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  
  // Thêm signature vào params
  const vnpUrlWithParams = `${vnpUrl}?${queryString}&vnp_SecureHash=${signed}`;
  
  return vnpUrlWithParams;
};

// Tạo Momo payment URL
const createMomoUrl = (booking, returnUrl) => {
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET;
  const partnerCode = 'MOMO';
  const orderId = `booking_${booking._id}_${Date.now()}`;
  const orderInfo = `Thanh toan booking ${booking._id}`;
  const amount = booking.amount;
  const ipnUrl = `${process.env.API_URL}/api/payment/callback/momo`;
  const redirectUrl = returnUrl;
  const requestType = 'captureWallet';
  const extraData = '';
  
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=${requestType}`;
  
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  
  const requestBody = {
    partnerCode: partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId: orderId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: 'vi',
    extraData: extraData,
    requestType: requestType,
    signature: signature
  };
  
  return {
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    data: requestBody
  };
};

// Tạo PayPal payment URL
const createPayPalUrl = (booking, returnUrl) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  // Trong thực tế, bạn cần tích hợp với PayPal SDK
  // Đây là mock implementation
  const paypalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${clientId}&item_name=Booking ${booking._id}&amount=${booking.amount}&currency_code=VND&return=${returnUrl}&cancel_return=${returnUrl}`;
  
  return paypalUrl;
};

// POST /api/payment/vnpay - Tạo VNPAY payment
router.post('/vnpay', authenticateToken, paymentValidation, handleValidationErrors, async (req, res) => {
  try {
    const { bookingId, returnUrl } = req.body;
    
    // Tìm booking
    const booking = await Booking.findById(bookingId)
      .populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    // Kiểm tra trạng thái booking
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking không ở trạng thái chờ thanh toán'
      });
    }
    
    // Tạo VNPAY URL
    const vnpayUrl = createVNPayUrl(booking, returnUrl);
    
    res.json({
      success: true,
      message: 'Tạo VNPAY payment thành công',
      data: {
        paymentUrl: vnpayUrl,
        bookingId: booking._id
      }
    });
    
  } catch (error) {
    console.error('Lỗi tạo VNPAY payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/payment/momo - Tạo Momo payment
router.post('/momo', authenticateToken, paymentValidation, handleValidationErrors, async (req, res) => {
  try {
    const { bookingId, returnUrl } = req.body;
    
    // Tìm booking
    const booking = await Booking.findById(bookingId)
      .populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    // Kiểm tra trạng thái booking
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking không ở trạng thái chờ thanh toán'
      });
    }
    
    // Tạo Momo payment data
    const momoData = createMomoUrl(booking, returnUrl);
    
    res.json({
      success: true,
      message: 'Tạo Momo payment thành công',
      data: {
        paymentUrl: momoData.url,
        paymentData: momoData.data,
        bookingId: booking._id
      }
    });
    
  } catch (error) {
    console.error('Lỗi tạo Momo payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/payment/paypal - Tạo PayPal payment
router.post('/paypal', authenticateToken, paymentValidation, handleValidationErrors, async (req, res) => {
  try {
    const { bookingId, returnUrl } = req.body;
    
    // Tìm booking
    const booking = await Booking.findById(bookingId)
      .populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    // Kiểm tra trạng thái booking
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking không ở trạng thái chờ thanh toán'
      });
    }
    
    // Tạo PayPal URL
    const paypalUrl = createPayPalUrl(booking, returnUrl);
    
    res.json({
      success: true,
      message: 'Tạo PayPal payment thành công',
      data: {
        paymentUrl: paypalUrl,
        bookingId: booking._id
      }
    });
    
  } catch (error) {
    console.error('Lỗi tạo PayPal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/payment/callback/vnpay - VNPAY callback
router.get('/callback/vnpay', async (req, res) => {
  try {
    const {
      vnp_TxnRef,
      vnp_Amount,
      vnp_ResponseCode,
      vnp_SecureHash
    } = req.query;
    
    // Verify signature
    const secretKey = process.env.VN_PAY_SECRET;
    const signData = Object.keys(req.query)
      .filter(key => key !== 'vnp_SecureHash')
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    
    if (signed !== vnp_SecureHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
    
    // Extract booking ID from order ID
    const bookingId = vnp_TxnRef.split('_')[1];
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Update booking status
    if (vnp_ResponseCode === '00') {
      booking.status = 'paid';
      booking.paymentStatus = 'paid';
      booking.paymentId = vnp_TxnRef;
      await booking.save();
      
      res.json({
        success: true,
        message: 'Thanh toán thành công'
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      
      res.json({
        success: false,
        message: 'Thanh toán thất bại'
      });
    }
    
  } catch (error) {
    console.error('Lỗi VNPAY callback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/payment/callback/momo - Momo callback
router.post('/callback/momo', async (req, res) => {
  try {
    const {
      orderId,
      resultCode,
      message,
      signature
    } = req.body;
    
    // Verify signature
    const secretKey = process.env.MOMO_SECRET;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${req.body.amount}&extraData=${req.body.extraData}&ipnUrl=${req.body.ipnUrl}&orderId=${orderId}&orderInfo=${req.body.orderInfo}&partnerCode=${req.body.partnerCode}&redirectUrl=${req.body.redirectUrl}&requestId=${req.body.requestId}&requestType=${req.body.requestType}`;
    
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
    
    // Extract booking ID from order ID
    const bookingId = orderId.split('_')[1];
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Update booking status
    if (resultCode === 0) {
      booking.status = 'paid';
      booking.paymentStatus = 'paid';
      booking.paymentId = orderId;
      await booking.save();
      
      res.json({
        success: true,
        message: 'Thanh toán thành công'
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      
      res.json({
        success: false,
        message: 'Thanh toán thất bại'
      });
    }
    
  } catch (error) {
    console.error('Lỗi Momo callback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/payment/callback/paypal - PayPal callback
router.get('/callback/paypal', async (req, res) => {
  try {
    const { tx, st } = req.query;
    
    // Trong thực tế, bạn cần verify với PayPal
    // Đây là mock implementation
    if (st === 'Completed') {
      // Extract booking ID from transaction
      const bookingId = tx.split('_')[1];
      const booking = await Booking.findById(bookingId);
      
      if (booking) {
        booking.status = 'paid';
        booking.paymentStatus = 'paid';
        booking.paymentId = tx;
        await booking.save();
        
        res.json({
          success: true,
          message: 'Thanh toán thành công'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy booking'
        });
      }
    } else {
      res.json({
        success: false,
        message: 'Thanh toán thất bại'
      });
    }
    
  } catch (error) {
    console.error('Lỗi PayPal callback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 