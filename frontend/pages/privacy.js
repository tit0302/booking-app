export default function Privacy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-10 rounded-xl shadow-soft max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700">Chính sách bảo mật</h1>
        <p className="text-gray-600 mb-2">EasyBook cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi dữ liệu được mã hóa và chỉ sử dụng cho mục đích cung cấp dịch vụ.</p>
        <ul className="list-disc pl-6 text-gray-500 space-y-2">
          <li>Không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý.</li>
          <li>Khách hàng có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân.</li>
        </ul>
      </div>
    </div>
  );
}