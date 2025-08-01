import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import BookingModal from '../../components/BookingModal';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function StayDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [reload, setReload] = useState(false);
  const [bookingError, setBookingError] = useState('');

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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  return (
    <div className="min-h-screen bg-secondary-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{label: 'Trang chủ', href: '/'}, {label: 'Lưu trú', href: '/stay'}, {label: service?.name || 'Chi tiết'}]} />
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
                <div className="text-primary-700 font-bold mb-2">{service.price?.toLocaleString()} đ/đêm</div>
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
              <button className="btn-primary mt-4" onClick={() => setShowBooking(true)}>Đặt dịch vụ</button>
              {bookingError && <div className="text-red-500 mt-2">{bookingError}</div>}
            </div>
            {/* Bản đồ Google Maps */}
            {service?.location && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Vị trí trên bản đồ:</h2>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '300px' }}
                    center={{ lat: service.location.lat || 21.028511, lng: service.location.lng || 105.804817 }}
                    zoom={15}
                  >
                    <Marker position={{ lat: service.location.lat || 21.028511, lng: service.location.lng || 105.804817 }} />
                  </GoogleMap>
                ) : (
                  <div>Đang tải bản đồ...</div>
                )}
              </div>
            )}
            {showBooking && (
              <BookingModal service={service} slots={slots} onClose={() => setShowBooking(false)} onBooked={() => { setShowBooking(false); setReload(r => !r); }} setBookingError={setBookingError} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}