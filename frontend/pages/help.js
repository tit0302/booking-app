export default function Help() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-10 rounded-xl shadow-soft max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700">Trung tâm trợ giúp</h1>
        <p className="text-gray-600 mb-2">Bạn cần hỗ trợ? Xem các câu hỏi thường gặp hoặc liên hệ đội ngũ EasyBook để được giải đáp nhanh nhất.</p>
        <ul className="list-disc pl-6 text-gray-500 space-y-2">
          <li>Làm sao để đặt dịch vụ?</li>
          <li>Làm sao để thanh toán an toàn?</li>
          <li>Chính sách hoàn tiền như thế nào?</li>
        </ul>
      </div>
    </div>
  );
}