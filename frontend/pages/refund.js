export default function Refund() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-10 rounded-xl shadow-soft max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700">Chính sách hoàn tiền</h1>
        <p className="text-gray-600 mb-2">EasyBook cam kết hoàn tiền nhanh chóng và minh bạch theo các điều kiện sau:</p>
        <ul className="list-disc pl-6 text-gray-500 space-y-2">
          <li>Hoàn tiền 100% nếu dịch vụ bị hủy do lỗi hệ thống.</li>
          <li>Hoàn tiền theo tỷ lệ nếu khách hàng hủy trước thời gian quy định.</li>
          <li>Không hoàn tiền nếu đã sử dụng dịch vụ.</li>
        </ul>
      </div>
    </div>
  );
}