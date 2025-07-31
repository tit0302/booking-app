import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import BookingModal from '../../components/BookingModal';

export default function TransportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (id) fetchService();
  }, [id, reload]);

  const fetchService = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/service/${id}`);
      setService(res.data.data.service);
      // Lấy slot
      const slotRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/service/${id}/slots`);
      setSlots(slotRes.data.data.slots || []);
    } catch (err) {
      setError('Không thể tải thông tin dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{label: 'Trang chủ', href: '/'}, {label: 'Vận chuyển', href: '/transport'}, {label: service?.name || 'Chi tiết'}]} />
        {loading ? (
          <div className="text-center text-primary-600 py-12">Đang tải...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : !service ? (
          <div className="text-center text-gray-500 py-12">Không tìm thấy dịch vụ.</div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-soft p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {service.image && <img src={service.image} alt={service.name} className="w-full h-full object-cover" />}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 text-primary-700">{service.name}</h1>
                <div className="text-gray-500 mb-2">{service.location}</div>
                <div className="text-primary-700 font-bold mb-2">{service.price?.toLocaleString()} đ/chuyến</div>
                <p className="mb-4 text-gray-600">{service.description}</p>
                <div className="mb-4">
                  <span className="font-semibold">Tiện ích:</span> {service.amenities?.join(', ') || 'Đang cập nhật'}
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Liên hệ:</span>{' '}
                  {service.contactInfo
                    ? typeof service.contactInfo === 'object'
                      ? [
                          service.contactInfo.phone && <span key="phone">📞 {service.contactInfo.phone} </span>,
                          service.contactInfo.email && <span key="email">✉️ {service.contactInfo.email} </span>,
                          service.contactInfo.address && <span key="address">🏠 {service.contactInfo.address}</span>
                        ].filter(Boolean)
                      : service.contactInfo
                    : 'Đang cập nhật'}
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Đánh giá:</span> {service.rating || 0} ({service.reviewCount || 0} đánh giá)
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Chọn thời gian đặt:</h2>
              {/* {slots.length === 0 ? (
                <div className="text-gray-500">Không còn slot trống.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(slot => (
                    <button key={slot} className="badge badge-primary">{new Date(slot).toLocaleString('vi-VN')}</button>
                  ))}
                </div>
              )} */}
              {slots.length === 0 ? (
                <div className="text-gray-500">Không còn slot trống.</div>
              ) : (
                <div className="text-gray-500">Còn slot trống.</div>
              )}
              <button className="btn-primary mt-4" onClick={() => setShowBooking(true)}>Đặt dịch vụ</button>
            </div>
          </div>
        )}
        {showBooking && (
          <BookingModal service={service} slots={slots} onClose={() => setShowBooking(false)} onBooked={() => { setShowBooking(false); setReload(r => !r); }} />
        )}
      </div>
    </div>
  );
}