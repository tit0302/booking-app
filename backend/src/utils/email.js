const nodemailer = require('nodemailer');

// Tạo transporter cho Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Template email xác nhận booking
const getBookingConfirmationTemplate = (booking, service, user) => {
  const bookingDate = new Date(booking.time).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `Xác nhận đặt dịch vụ - ${service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>EasyBook - Xác nhận đặt dịch vụ</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Xin chào ${user.name}!</h2>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của EasyBook. Dưới đây là thông tin chi tiết về booking của bạn:</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Thông tin dịch vụ</h3>
            <p><strong>Dịch vụ:</strong> ${service.name}</p>
            <p><strong>Địa điểm:</strong> ${service.location}</p>
            <p><strong>Thời gian:</strong> ${bookingDate}</p>
            <p><strong>Số tiền:</strong> ${booking.amount.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Trạng thái:</strong> ${booking.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}</p>
            <p><strong>Phương thức thanh toán:</strong> ${booking.paymentMethod.toUpperCase()}</p>
          </div>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Thông tin liên hệ</h3>
            <p><strong>Tên:</strong> ${booking.customerInfo.name}</p>
            <p><strong>Email:</strong> ${booking.customerInfo.email}</p>
            <p><strong>Số điện thoại:</strong> ${booking.customerInfo.phone}</p>
            ${booking.customerInfo.note ? `<p><strong>Ghi chú:</strong> ${booking.customerInfo.note}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Thông tin liên hệ dịch vụ</h3>
            <p><strong>Điện thoại:</strong> ${service.contactInfo.phone}</p>
            <p><strong>Email:</strong> ${service.contactInfo.email}</p>
            <p><strong>Địa chỉ:</strong> ${service.contactInfo.address}</p>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại trên.
          </p>
          
          <p style="margin-top: 20px; color: #666;">
            Trân trọng,<br>
            Đội ngũ EasyBook
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 EasyBook. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `
  };
};

// Template email nhắc lịch
const getReminderTemplate = (booking, service, user) => {
  const bookingDate = new Date(booking.time).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `Nhắc lịch - Dịch vụ ${service.name} vào ngày mai`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center;">
          <h1>EasyBook - Nhắc lịch</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Xin chào ${user.name}!</h2>
          <p>Đây là email nhắc lịch cho booking của bạn vào ngày mai:</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Thông tin dịch vụ</h3>
            <p><strong>Dịch vụ:</strong> ${service.name}</p>
            <p><strong>Địa điểm:</strong> ${service.location}</p>
            <p><strong>Thời gian:</strong> ${bookingDate}</p>
            <p><strong>Số tiền:</strong> ${booking.amount.toLocaleString('vi-VN')} VNĐ</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h4>📅 Lưu ý quan trọng:</h4>
            <ul>
              <li>Vui lòng đến đúng giờ đã đặt</li>
              <li>Mang theo giấy tờ tùy thân</li>
              <li>Liên hệ ngay nếu có thay đổi</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Thông tin liên hệ dịch vụ</h3>
            <p><strong>Điện thoại:</strong> ${service.contactInfo.phone}</p>
            <p><strong>Email:</strong> ${service.contactInfo.email}</p>
            <p><strong>Địa chỉ:</strong> ${service.contactInfo.address}</p>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            Chúc bạn có một trải nghiệm tuyệt vời!<br>
            Trân trọng,<br>
            Đội ngũ EasyBook
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 EasyBook. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `
  };
};

// Gửi email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return { success: false, error: error.message };
  }
};

// Gửi email xác nhận booking
const sendBookingConfirmation = async (booking, service, user) => {
  const template = getBookingConfirmationTemplate(booking, service, user);
  return await sendEmail(user.email, template.subject, template.html);
};

// Gửi email nhắc lịch
const sendBookingReminder = async (booking, service, user) => {
  const template = getReminderTemplate(booking, service, user);
  return await sendEmail(user.email, template.subject, template.html);
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingReminder
}; 