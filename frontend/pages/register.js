import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`, { name, email, password });
      if (res.data.success) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(res.data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-8 rounded-xl shadow-soft w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-primary-700 text-center">Đăng ký tài khoản</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="text" placeholder="Họ và tên" className="input-field" required value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" className="input-field" required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Mật khẩu" className="input-field" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center mt-2">{success}</div>}
        </form>
        <p className="mt-4 text-center text-gray-500 text-sm">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-primary-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}