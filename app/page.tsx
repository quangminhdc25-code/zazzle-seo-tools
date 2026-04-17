'use client';

import { useState } from 'react';

export default function ZazzleSEOTool() {
  // 1. Thay đổi State (Biến lưu trữ dữ liệu)
  const [coreSubject, setCoreSubject] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [vibe, setVibe] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 3. Thay đổi Dữ liệu gửi đi trong hàm gọi API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreSubject) {
      setError('Vui lòng nhập Core Subject (Chủ thể hình ảnh).');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coreSubject, targetAudience, vibe, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra từ máy chủ.');
      }

      if (data.variants) {
        setResults(data.variants);
      } else {
        throw new Error('Dữ liệu trả về không đúng định dạng.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center">Zazzle SEO Pro Generator</h1>

      <form onSubmit={handleGenerate} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
        {/* 2. Thay đổi Giao diện Ô nhập liệu */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Core Subject (Chủ thể thiết kế) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="VD: Black Crow, Messy Bun, Floral Skull..."
            value={coreSubject}
            onChange={(e) => setCoreSubject(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Target Audience (Khách hàng mục tiêu)
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="VD: Dog Mom, Introvert, Union Worker..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Vibe / Theme / Occasion (Phong cách / Dịp lễ)
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="VD: Halloween, Funny, Dark Fantasy, Labor Day..."
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Số lượng bộ nội dung cần tạo (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            className="shadow appearance-none border rounded w-full md:w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full md:w-auto ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Đang xử lý (Vui lòng đợi)...' : 'Tạo nội dung SEO'}
          </button>
        </div>
      </form>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Hiển thị kết quả */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Kết quả tạo:</h2>
          {results.map((variant, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-blue-800 mb-2">
                Variant {index + 1}
              </h3>
              
              <div className="mb-3">
                <span className="font-bold text-gray-700">Title: </span>
                <span className="text-gray-900">{variant.newTitle}</span>
              </div>
              
              <div className="mb-3">
                <span className="font-bold text-gray-700">Description: </span>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{variant.newDescription}</p>
              </div>
              
              <div>
                <span className="font-bold text-gray-700">Tags: </span>
                <span className="text-gray-900">{variant.newTags}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}