import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import BookingModal from '../../components/BookingModal';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function TransportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [reload, setReload] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('waiting'); // waiting, enroute, arrived

  // Function tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

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
              <button className="btn-primary mt-4" onClick={() => setShowBooking(true)}>Đặt dịch vụ</button>
              {bookingError && <div className="text-red-500 mt-2">{bookingError}</div>}
            </div>
            {/* Bản đồ Google Maps với tracking tài xế */}
            {service?.location && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Vị trí và theo dõi tài xế:</h2>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '400px' }}
                    center={{ lat: service.location.lat || 21.028511, lng: service.location.lng || 105.804817 }}
                    zoom={15}
                  >
                    {/* Marker vị trí đích */}
                    <Marker 
                      position={{ lat: service.location.lat || 21.028511, lng: service.location.lng || 105.804817 }}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      }}
                    />
                    {/* Marker vị trí tài xế (nếu có) */}
                    {driverLocation && (
                      <Marker 
                        position={driverLocation}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div>Đang tải bản đồ...</div>
                )}
              </div>
            )}
            {/* Tiến trình di chuyển nâng cao */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Tiến trình di chuyển:</h2>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    trackingStatus === 'waiting' ? 'bg-yellow-500 w-1/3' :
                    trackingStatus === 'enroute' ? 'bg-blue-500 w-2/3' :
                    'bg-green-500 w-full'
                  }`}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={trackingStatus === 'waiting' ? 'font-bold' : ''}>Chờ tài xế</span>
                <span className={trackingStatus === 'enroute' ? 'font-bold' : ''}>Đang di chuyển</span>
                <span className={trackingStatus === 'arrived' ? 'font-bold' : ''}>Đã đến</span>
              </div>
              {driverLocation && (
                <div className="mt-2 text-sm text-gray-600">
                  Tài xế cách đích: {Math.round(calculateDistance(driverLocation, {lat: service.location.lat || 21.028511, lng: service.location.lng || 105.804817}))}km
                </div>
              )}
            </div>
            {showBooking && (
              <BookingModal service={service} slots={slots} onClose={() => setShowBooking(false)} onBooked={() => { setShowBooking(false); setReload(r => !r); }} setBookingError={setBookingError} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}