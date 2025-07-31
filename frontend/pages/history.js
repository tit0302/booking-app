import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Breadcrumb from '../components/Breadcrumb';

export default function History() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/booking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.data.bookings || []);
    } catch (err) {
      setError('Không thể tải lịch sử booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{label: 'Trang chủ', href: '/'}, {label: 'Lịch sử booking'}]} />
        <h1 className="text-3xl font-bold mb-8 text-primary-700">Lịch sử đặt dịch vụ</h1>
        <div className="bg-white rounded-xl shadow-soft p-6">
          {loading ? (
            <div className="text-center text-primary-600 py-12">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Chưa có booking nào.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4">Dịch vụ</th>
                  <th className="py-2 px-4">Ngày đặt</th>
                  <th className="py-2 px-4">Trạng thái</th>
                  <th className="py-2 px-4">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} className="border-t">
                    <td className="py-2 px-4">{b.serviceId?.name || '---'}</td>
                    <td className="py-2 px-4">{new Date(b.time).toLocaleString('vi-VN')}</td>
                    <td className="py-2 px-4">
                      <span className={`badge ${b.status === 'paid' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>{b.status}</span>
                    </td>
                    <td className="py-2 px-4">
                      <Link href={`/booking/${b._id}`} className="btn-secondary btn-sm">Xem chi tiết</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}