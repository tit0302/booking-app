export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-10 rounded-xl shadow-soft max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700">Liên hệ</h1>
        <form className="space-y-4">
          <input type="text" placeholder="Họ và tên" className="input-field" required />
          <input type="email" placeholder="Email" className="input-field" required />
          <textarea placeholder="Nội dung" className="input-field" rows={4} required />
          <button type="submit" className="btn-primary w-full">Gửi liên hệ</button>
        </form>
      </div>
    </div>
  );
}