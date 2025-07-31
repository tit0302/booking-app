export default function News() {
  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-primary-700">Tin tức</h1>
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="card card-hover p-6">
              <h2 className="text-xl font-semibold mb-2">Tin nổi bật {i}</h2>
              <p className="text-gray-500 mb-2">Mô tả ngắn về tin tức {i}...</p>
              <button className="btn-secondary">Xem chi tiết</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}