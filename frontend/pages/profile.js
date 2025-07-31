import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data.user);
      setName(res.data.data.user.name);
      setAvatar(res.data.data.user.avatar || '');
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/profile`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cập nhật thành công!');
      fetchProfile();
    } catch (err) {
      setError('Cập nhật thất bại.');
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Đổi avatar thành công!');
      fetchProfile();
    } catch (err) {
      setError('Đổi avatar thất bại.');
    }
  };

  const handleChangePassword = async () => {
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/password`, { password, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Đổi mật khẩu thành công!');
      setPassword(''); setNewPassword('');
    } catch (err) {
      setError('Đổi mật khẩu thất bại.');
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ cá nhân</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-4 flex items-center gap-4">
        <img src={avatar || '/avatar.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
        <input type="file" accept="image/*" onChange={handleAvatar} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tên</label>
        <input className="input-field w-full" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <button className="btn-primary mb-6" onClick={handleUpdate}>Cập nhật</button>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Mật khẩu hiện tại</label>
        <input type="password" className="input-field w-full" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Mật khẩu mới</label>
        <input type="password" className="input-field w-full" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      </div>
      <button className="btn-secondary" onClick={handleChangePassword}>Đổi mật khẩu</button>
    </div>
  );
}