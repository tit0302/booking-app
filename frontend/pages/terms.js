export default function Terms() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="bg-white p-10 rounded-xl shadow-soft max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-primary-700">Điều khoản sử dụng</h1>
        <p className="text-gray-600 mb-2">Khi sử dụng EasyBook, bạn đồng ý tuân thủ các điều khoản và điều kiện sau:</p>
        <ul className="list-disc pl-6 text-gray-500 space-y-2">
          <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp.</li>
          <li>Bảo mật thông tin tài khoản cá nhân.</li>
          <li>Tuân thủ các quy định về thanh toán và hoàn tiền.</li>
        </ul>
      </div>
    </div>
  );
}