import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';

export default function BookingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/booking/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(res.data.data.booking);
    } catch (err) {
      setError('Không thể tải thông tin booking.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!booking) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Breadcrumb items={[{label: 'Trang chủ', href: '/'}, {label: 'Lịch sử booking', href: '/history'}, {label: 'Chi tiết booking'}]} />
      <h1 className="text-2xl font-bold mb-4">Chi tiết booking</h1>
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="mb-2"><b>Dịch vụ:</b> {booking.serviceId?.name}</div>
        <div className="mb-2"><b>Loại:</b> {booking.serviceId?.type}</div>
        <div className="mb-2"><b>Thời gian:</b> {new Date(booking.time).toLocaleString('vi-VN')}</div>
        <div className="mb-2"><b>Khách:</b> {booking.name} - {booking.phone}</div>
        <div className="mb-2"><b>Trạng thái:</b> <span className={`badge ${booking.status === 'paid' ? 'badge-success' : booking.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>{booking.status}</span></div>
        <div className="mb-2"><b>Phương thức thanh toán:</b> {booking.paymentMethod}</div>
        <div className="mb-2"><b>Ghi chú:</b> {booking.note || '---'}</div>
      </div>
    </div>
  );
}