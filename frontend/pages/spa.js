import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Spa() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/service?type=spa`);
      setServices(res.data.data.services || []);
    } catch (err) {
      setError('Không thể tải danh sách spa.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-primary-700">Spa & Wellness</h1>
        <div className="mb-6 flex justify-between items-center gap-4 flex-wrap">
          <input
            className="input-field max-w-xs"
            placeholder="Tìm kiếm tên spa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={fetchServices} className="btn-secondary">Làm mới</button>
        </div>
        {loading ? (
          <div className="text-center text-primary-600 py-12">Đang tải...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Không có spa phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(s => (
              <div key={s._id} className="card card-hover p-6 flex flex-col">
                <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {s.image && <img src={s.image} alt={s.name} className="w-full h-full object-cover" />}
                </div>
                <h2 className="text-xl font-semibold mb-2">{s.name}</h2>
                <p className="text-gray-500 mb-2 line-clamp-2">{s.description}</p>
                <div className="text-primary-700 font-bold mb-2">{s.price?.toLocaleString()} đ/lần</div>
                <button className="btn-primary mt-auto text-center">Xem chi tiết</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}