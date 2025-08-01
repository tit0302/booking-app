import { useState, useMemo } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function BookingModal({ service, slots, onClose, onBooked, setBookingError }) {
  // Chuyển slot sang Date object
  const slotDates = useMemo(() => slots.map(s => new Date(s)), [slots]);
  // Lấy danh sách ngày có slot
  const availableDays = useMemo(() => {
    const days = {};
    slotDates.forEach(date => {
      const key = date.toISOString().slice(0, 10); // yyyy-mm-dd
      if (!days[key]) days[key] = [];
      days[key].push(date);
    });
    return days;
  }, [slotDates]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('vnpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy slot giờ của ngày đã chọn
  const slotsOfDay = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().slice(0, 10);
    return availableDays[key] || [];
  }, [selectedDate, availableDays]);

  // Chỉ enable ngày có slot
  const isDayEnabled = date => {
    const key = date.toISOString().slice(0, 10);
    return !!availableDays[key];
  };

  const handleBooking = async () => {
    // Validation chi tiết
    if (!selectedSlot) {
      setError('Vui lòng chọn khung giờ.');
      return;
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên khách.');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!/^[0-9+\-\s()]+$/.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để đặt dịch vụ.');
        return;
      }

      // Format dữ liệu theo đúng schema backend
      const bookingData = {
        serviceId: service._id,
        time: selectedSlot,
        paymentMethod: payment,
        amount: service.price || 0, // Lấy giá từ service
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          email: 'customer@example.com', // Tạm thời, có thể thêm field email sau
          note: '' // Có thể thêm field note sau
        }
      };

      console.log('Sending booking data:', bookingData);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/booking`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (payment === 'vnpay' || payment === 'momo' || payment === 'paypal') {
          // Gọi API tạo link thanh toán
          const payRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payment/${payment}`, {
            bookingId: res.data.data.booking._id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          window.location.href = payRes.data.data.paymentUrl;
        } else {
          onBooked && onBooked();
          onClose();
        }
      } else {
        setError(res.data.message || 'Đặt lịch thất bại.');
        setBookingError && setBookingError(res.data.message || 'Đặt lịch thất bại.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi đặt lịch. Vui lòng thử lại.';
      setError(errorMsg);
      setBookingError && setBookingError(errorMsg);
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={onClose}>×</button>
        <h2 className="text-xl font-bold mb-4">Đặt dịch vụ: {service.name}</h2>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Chọn ngày đặt:</label>
          <DatePicker
            selected={selectedDate}
            onChange={date => { setSelectedDate(date); setSelectedSlot(null); }}
            filterDate={isDayEnabled}
            minDate={new Date()}
            inline
            calendarClassName="!bg-white"
            dayClassName={date => isDayEnabled(date) ? 'bg-primary-100 text-primary-700 font-bold' : 'text-gray-300'}
            placeholderText="Chọn ngày có slot"
          />
        </div>
        {selectedDate && (
          <div className="mb-3">
            <label className="block font-semibold mb-1">Chọn khung giờ:</label>
            <div className="flex flex-wrap gap-2">
              {slotsOfDay.length === 0 ? (
                <span className="text-gray-500">Không còn slot trống trong ngày này.</span>
              ) : (
                slotsOfDay.map(slot => (
                  <button
                    key={slot.toISOString()}
                    className={`badge ${selectedSlot && new Date(selectedSlot).getTime() === slot.getTime() ? 'badge-primary' : 'badge-outline'}`}
                    onClick={() => setSelectedSlot(slot.toISOString())}
                  >
                    {slot.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        <div className="mb-3">
          <label className="block font-semibold mb-1">Tên khách:</label>
          <input className="input-field w-full" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Số điện thoại:</label>
          <input className="input-field w-full" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Phương thức thanh toán:</label>
          <select className="input-field w-full" value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="vnpay">VNPAY</option>
            <option value="momo">Momo</option>
            <option value="paypal">PayPal</option>
            <option value="cod">Thanh toán tại chỗ</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button className="btn-primary w-full" onClick={handleBooking} disabled={loading}>{loading ? 'Đang đặt...' : 'Đặt dịch vụ'}</button>
      </div>
    </div>
  );
}