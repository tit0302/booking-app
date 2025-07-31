import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HiSearch, 
  HiStar, 
  HiCheck, 
  HiShieldCheck,
  HiClock,
  HiUserGroup,
  HiGlobe,
  HiHeart
} from 'react-icons/hi';
import Layout from '../components/Layout';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: HiSearch,
      title: 'Tìm kiếm dễ dàng',
      description: 'Tìm kiếm và so sánh các dịch vụ một cách nhanh chóng'
    },
    {
      icon: HiShieldCheck,
      title: 'An toàn & Bảo mật',
      description: 'Thanh toán an toàn với nhiều phương thức khác nhau'
    },
    {
      icon: HiClock,
      title: 'Đặt lịch 24/7',
      description: 'Đặt dịch vụ bất cứ lúc nào, mọi nơi'
    },
    {
      icon: HiUserGroup,
      title: 'Hỗ trợ tận tâm',
      description: 'Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giúp đỡ'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Khách hàng hài lòng' },
    { number: '500+', label: 'Dịch vụ chất lượng' },
    { number: '50+', label: 'Thành phố phủ sóng' },
    { number: '99%', label: 'Tỷ lệ hài lòng' }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Khách hàng',
      content: 'Dịch vụ rất tốt, đặt lịch dễ dàng và thanh toán thuận tiện.',
      rating: 5
    },
    {
      name: 'Trần Thị B',
      role: 'Doanh nghiệp',
      content: 'EasyBook giúp chúng tôi quản lý booking hiệu quả hơn rất nhiều.',
      rating: 5
    },
    {
      name: 'Lê Văn C',
      role: 'Khách hàng',
      content: 'Giao diện đẹp, dễ sử dụng và hỗ trợ khách hàng rất tốt.',
      rating: 5
    }
  ];

  return (
    <>
      <Head>
        <title>EasyBook - Nền tảng đặt dịch vụ hàng đầu Việt Nam</title>
        <meta 
          name="description" 
          content="EasyBook - Nền tảng đặt dịch vụ lưu trú, vận chuyển và các dịch vụ khác. Đặt lịch dễ dàng, thanh toán an toàn, hỗ trợ 24/7." 
        />
        <meta 
          name="keywords" 
          content="đặt dịch vụ, booking, lưu trú, vận chuyển, homestay, resort, xe dịch vụ, thanh toán online" 
        />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <div className="absolute inset-0 bg-black/5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Đặt dịch vụ{' '}
                <span className="text-primary-600">dễ dàng</span>
                <br />
                <span className="text-2xl md:text-4xl">với EasyBook</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Nền tảng đặt dịch vụ hàng đầu Việt Nam. Tìm kiếm, đặt lịch và thanh toán 
                tất cả trong một ứng dụng duy nhất.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm dịch vụ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-primary-500 focus:outline-none shadow-soft"
                  />
                  <button className="absolute right-2 top-2 bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors">
                    <HiSearch className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/stay"
                  className="bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-700 transition-colors shadow-medium"
                >
                  Khám phá lưu trú
                </Link>
                <Link
                  href="/transport"
                  className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Dịch vụ vận chuyển
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tại sao chọn EasyBook?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chúng tôi cung cấp trải nghiệm đặt dịch vụ tốt nhất với những tính năng độc đáo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-soft transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-primary-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Dịch vụ của chúng tôi
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Khám phá các dịch vụ đa dạng và chất lượng cao
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stay Services */}
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-large transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
                    alt="Lưu trú"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">Lưu trú</h3>
                      <p className="text-lg">Homestay, Resort, Khách sạn</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Khám phá các điểm lưu trú độc đáo từ homestay ấm cúng đến resort sang trọng.
                  </p>
                  <Link
                    href="/stay"
                    className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Khám phá ngay
                    <HiGlobe className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Transport Services */}
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-large transition-shadow">
                <div className="relative h-64">
                  <Image
                    src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=800"
                    alt="Vận chuyển"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">Vận chuyển</h3>
                      <p className="text-lg">Xe dịch vụ, Limousine</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Dịch vụ vận chuyển cao cấp với xe đời mới và tài xế chuyên nghiệp.
                  </p>
                  <Link
                    href="/transport"
                    className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Khám phá ngay
                    <HiGlobe className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Khách hàng nói gì về chúng tôi
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Những đánh giá chân thực từ khách hàng đã sử dụng dịch vụ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <HiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Đăng ký ngay để nhận ưu đãi đặc biệt và trải nghiệm dịch vụ tốt nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
} 