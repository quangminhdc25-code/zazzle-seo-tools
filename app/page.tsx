'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant {
  newTitle: string;
  newDescription: string;
  newTags: string;
}

interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all shadow-sm ${copied ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
};

export default function ZazzleSEOTool() {
  const [textDesign, setTextDesign] = useState('');
  const [insightContext, setInsightContext] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [amazonCount, setAmazonCount] = useState(1);
  const [amazonItems, setAmazonItems] = useState<AmazonItem[]>([{ title: '', description: '' }]);

  const [etsyCount, setEtsyCount] = useState(1);
  const [etsyItems, setEtsyItems] = useState<EtsyItem[]>([{ title: '', tags: '' }]);
  
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zazzle_history_v4.1');
    if (saved) {
      try { setResults(JSON.parse(saved) as ZazzleVariant[]); } catch (e) {}
    }
  }, []);

  const handleAmazonCountChange = (val: number) => {
    setAmazonCount(val);
    setAmazonItems(prev => {
      const newArr = [...prev];
      while(newArr.length < val) newArr.push({ title: '', description: '' });
      return newArr.slice(0, val);
    });
  };

  const handleEtsyCountChange = (val: number) => {
    setEtsyCount(val);
    setEtsyItems(prev => {
      const newArr = [...prev];
      while(newArr.length < val) newArr.push({ title: '', tags: '' });
      return newArr.slice(0, val);
    });
  };

  const updateAmazonItem = (index: number, field: keyof AmazonItem, value: string) => {
    const newItems = [...amazonItems];
    newItems[index][field] = value;
    setAmazonItems(newItems);
  };

  const updateEtsyItem = (index: number, field: keyof EtsyItem, value: string) => {
    const newItems = [...etsyItems];
    newItems[index][field] = value;
    setEtsyItems(newItems);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDesign) return setError('Trường "Text Design" không được để trống.');
    setLoading(true); setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amazonItems, etsyItems, insightContext, textDesign, quantity }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lỗi server');

      if (data.variants) {
        const newHistory = [...data.variants, ...results].slice(0, 50);
        setResults(newHistory);
        localStorage.setItem('zazzle_history_v4.1', JSON.stringify(newHistory));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if(confirm('Xóa toàn bộ lịch sử?')) {
        setResults([]);
        localStorage.removeItem('zazzle_history_v4.1');
    }
  }

  return (
    <div className="w-full min-h-screen p-4 lg:p-8 font-sans bg-slate-100 text-slate-900">
      <header className="mb-8 flex flex-col items-center">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          ZAZZLE SEO <span className="text-blue-600">ARCHITECT</span>
        </h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-3 bg-slate-200 px-3 py-1 rounded-full">
          Version 4.1 • Gemini 1.5 Pro (Free Tier)
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* CỘT TRÁI: FORM NHẬP LIỆU */}
        <div className="w-full xl:w-1/2">
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-slate-200">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex flex-col">
                <label className="text-xs font-black text-blue-900 uppercase mb-2">Text Design (Bắt buộc lên đầu Title)</label>
                <input type="text" placeholder="Ví dụ: Mama Bear" className="p-4 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" value={textDesign} onChange={(e) => setTextDesign(e.target.value)} required />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-black text-blue-900 uppercase mb-2">Số lượng kết quả (Variants)</label>
                <select className="p-4 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold cursor-pointer" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Tạo {n} kết quả</option>)}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-xs font-black text-emerald-700 uppercase mb-3 block">Insight Context / Bài viết nền</label>
              <textarea placeholder="Dán nội dung bài blog, bài viết văn hóa để AI tạo Storytelling Description..." className="w-full h-32 p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-400 outline-none text-sm" value={insightContext} onChange={(e) => setInsightContext(e.target.value)} />
            </div>

            {/* Khối AMAZON */}
            <div className="mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black text-orange-800 uppercase">Amazon Data</label>
                <select className="p-2 border border-orange-300 rounded-lg text-xs font-bold bg-white" value={amazonCount} onChange={(e) => handleAmazonCountChange(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {amazonItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-orange-200 space-y-3">
                    <span className="text-[10px] font-bold text-orange-500 uppercase bg-orange-100 px-2 py-1 rounded">Item {idx + 1}</span>
                    <input type="text" placeholder="Amazon Title..." className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400" value={item.title} onChange={(e) => updateAmazonItem(idx, 'title', e.target.value)} />
                    <textarea placeholder="Amazon Description..." className="w-full h-20 p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400" value={item.description} onChange={(e) => updateAmazonItem(idx, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Khối ETSY */}
            <div className="mb-8 bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black text-amber-800 uppercase">Etsy Data</label>
                <select className="p-2 border border-amber-300 rounded-lg text-xs font-bold bg-white" value={etsyCount} onChange={(e) => handleEtsyCountChange(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {etsyItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-amber-200 space-y-3">
                    <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-100 px-2 py-1 rounded">Item {idx + 1}</span>
                    <input type="text" placeholder="Etsy Title..." className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400" value={item.title} onChange={(e) => updateEtsyItem(idx, 'title', e.target.value)} />
                    <input type="text" placeholder="Etsy Tags (Comma separated)..." className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-amber-400" value={item.tags} onChange={(e) => updateEtsyItem(idx, 'tags', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white tracking-widest shadow-xl transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
              {loading ? 'ĐANG PHÂN TÍCH & TẠO SEO...' : 'GENERATE ZAZZLE LISTING'}
            </button>
            {error && <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-xl font-bold text-center text-sm">{error}</div>}
          </form>
        </div>

        {/* CỘT PHẢI: KẾT QUẢ ĐẦU RA */}
        <div className="w-full xl:w-1/2">
          <div className="sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Lịch sử kết quả</h2>
              {results.length > 0 && <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-700 font-bold underline">Xóa lịch sử</button>}
            </div>

            <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-4 custom-scrollbar">
              {results.length === 0 && <div className="text-center p-10 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold">Chưa có kết quả nào.</div>}
              {results.map((variant, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden relative">
                  {idx === 0 && <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl z-10">MỚI NHẤT</div>}
                  <div className="p-6 lg:p-8 space-y-6">
                    
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Title</span>
                        <CopyButton text={variant.newTitle} />
                      </div>
                      <p className="text-lg font-black text-slate-900 leading-tight">{variant.newTitle}</p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Description</span>
                        <CopyButton text={variant.newDescription} />
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-line">{variant.newDescription}</p>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-inner">
                      <div className="flex justify-between items-center gap-4 mb-3">
                        <span className="text-[10px] font-black text-emerald-400 uppercase">Tags (Unique)</span>
                        <CopyButton text={variant.newTags} />
                      </div>
                      <p className="text-xs font-mono font-bold text-white tracking-wide leading-relaxed">{variant.newTags}</p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}