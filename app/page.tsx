'use client';
import { useState } from 'react';

export default function Home() {
  const [original, setOriginal] = useState({ title: '', description: '' });
  const [quantity, setQuantity] = useState(1); // Thêm trạng thái lưu số lượng
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{title: string, description: string, tags: string}[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!original.title || !original.description) {
      alert('Vui lòng nhập đủ Title và Description từ sản phẩm Amazon!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...original, quantity }), // Gửi thêm biến quantity
      });
      const data = await res.json();

      if (data.variants && Array.isArray(data.variants)) {
        // AI trả về một mảng chứa nhiều kết quả
        const newResults = data.variants.map((v: any) => ({
          title: v.newTitle || '',
          description: v.newDescription || '',
          tags: v.newTags || ''
        }));
        
        // Đưa các kết quả mới lên đầu danh sách
        setResults((prev) => [...newResults, ...prev]);
      } else {
        alert('Có lỗi định dạng từ AI, vui lòng thử lại.');
      }
    } catch (error) {
      alert('Lỗi kết nối, vui lòng thử lại.');
    }
    setLoading(false);
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto font-sans text-gray-900 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Amazon to Zazzle - Mass SEO Optimizer</h1>

      <div className="bg-gray-50 p-6 rounded-lg mb-8 shadow-md border border-gray-200">
        <h2 className="font-bold mb-4 text-lg">1. Nhập Dữ Liệu Winning T-Shirt Từ Amazon</h2>
        <input
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Dán Title Amazon vào đây..."
          value={original.title}
          onChange={(e) => setOriginal({...original, title: e.target.value})}
        />
        <textarea
          className="w-full p-3 border border-gray-300 rounded mb-4 h-40 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Dán toàn bộ Description / Bullet Points của Amazon vào đây..."
          value={original.description}
          onChange={(e) => setOriginal({...original, description: e.target.value})}
        />
        
        <div className="flex items-center mb-6 bg-white p-3 border border-gray-300 rounded">
          <label className="font-bold text-gray-700 mr-4">Số lượng biến thể cần tạo:</label>
          <select 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded font-medium outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={1}>1 bộ</option>
            <option value={2}>2 bộ (Khuyên dùng)</option>
            <option value={3}>3 bộ</option>
            <option value={4}>4 bộ</option>
            <option value={5}>5 bộ</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-lg text-lg"
        >
          {loading ? '⏳ AI đang làm việc... (Bạn có thể dán bài mới vào ô trên)' : `2. Bấm Generate (${quantity} bộ)`}
        </button>
      </div>

      <div>
        <h2 className="font-bold mb-4 text-xl border-b pb-2">Kết Quả Chuẩn SEO: {results.length} bộ</h2>
        {results.length === 0 && <p className="text-gray-500 italic">Chưa có kết quả nào. Hãy bấm Generate ở trên.</p>}
        {results.map((item, index) => {
          const resultIndex = results.length - index;
          return (
            <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-5 rounded-r-lg mb-6 relative shadow-sm">
              <span className="absolute top-2 right-2 bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full font-bold">Bản #{resultIndex}</span>
              
              <div className="mb-4 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-gray-700">Zazzle Title:</strong>
                  <button onClick={() => handleCopy(item.title, `title-${index}`)} className="text-sm bg-gray-200 hover:bg-green-500 hover:text-white text-gray-700 px-3 py-1 rounded transition font-medium">
                    {copiedField === `title-${index}` ? 'Đã Copy ✓' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white p-3 border border-gray-200 rounded text-gray-800 font-semibold">{item.title}</div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-gray-700">Zazzle Description:</strong>
                  <button onClick={() => handleCopy(item.description, `desc-${index}`)} className="text-sm bg-gray-200 hover:bg-green-500 hover:text-white text-gray-700 px-3 py-1 rounded transition font-medium">
                    {copiedField === `desc-${index}` ? 'Đã Copy ✓' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white p-3 border border-gray-200 rounded whitespace-pre-wrap text-gray-800">{item.description}</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-gray-700">Zazzle Tags:</strong>
                  <button onClick={() => handleCopy(item.tags, `tags-${index}`)} className="text-sm bg-gray-200 hover:bg-green-500 hover:text-white text-gray-700 px-3 py-1 rounded transition font-medium">
                    {copiedField === `tags-${index}` ? 'Đã Copy ✓' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white p-3 border border-gray-200 rounded text-gray-800">{item.tags}</div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}