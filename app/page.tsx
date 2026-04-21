'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button 
      onClick={copy} 
      className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-200 border shadow-sm ${
        ok 
        ? 'bg-blue-600 border-blue-600 text-white' 
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {ok ? 'ĐÃ COPY' : 'COPY'}
    </button>
  );
};

export default function Ver13Tool() {
  const [textDesign, setTextDesign] = useState('');
  const [insight, setInsight] = useState('');
  const [qty, setQty] = useState(1);
  const [amzCount, setAmzCount] = useState(1);
  const [amzItems, setAmzItems] = useState<AmazonItem[]>([{ title: '', description: '' }]);
  const [etsyCount, setEtsyCount] = useState(1);
  const [etsyItems, setEtsyItems] = useState<EtsyItem[]>([{ title: '', tags: '' }]);
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterIndex, setFilterIndex] = useState<number | 'all'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('zazzle_v13.0');
    if (saved) setResults(JSON.parse(saved));
  }, []);

  const handleAmzCount = (n: number) => {
    setAmzCount(n);
    setAmzItems(prev => {
      const next = [...prev];
      while(next.length < n) next.push({ title: '', description: '' });
      return next.slice(0, n);
    });
  };

  const handleEtsyCount = (n: number) => {
    setEtsyCount(n);
    setEtsyItems(prev => {
      const next = [...prev];
      while(next.length < n) next.push({ title: '', tags: '' });
      return next.slice(0, n);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDesign) return setError('Vui lòng nhập Text Design Prefix.');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amazonItems: amzItems, etsyItems: etsyItems, insightContext: insight, textDesign, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newResults = [...data.variants, ...results].slice(0, 50);
      setResults(newResults);
      setFilterIndex('all');
      localStorage.setItem('zazzle_v13.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Tính phần trăm tiến độ mô phỏng
  const calculateProgress = () => {
    let filled = 0;
    if (textDesign) filled += 25;
    if (insight) filled += 25;
    if (amzItems[0]?.title) filled += 25;
    if (etsyItems[0]?.title) filled += 25;
    return filled;
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gradient-to-r from-purple-200 via-pink-100 to-orange-50 selection:bg-blue-200 selection:text-blue-900 pb-20">
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
        
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg shadow-lg">ZA</div>
            Zazzle SEO Architect
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-2 ml-14 uppercase tracking-widest">Version 13.0 • Premium Glassmorphism</p>
        </header>

        {/* PROGRESS BAR (Mô phỏng theo hình) */}
        <div className="bg-white/50 backdrop-blur-xl rounded-full p-3 px-6 text-sm mb-8 flex items-center justify-between shadow-sm border border-white/60">
          <div className="text-slate-800 font-bold whitespace-nowrap">Tiến độ thiết lập: <span className="text-blue-600">{calculateProgress()}%</span></div>
          <div className="h-2 w-1/2 bg-white/50 rounded-full flex-grow mx-6 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
          <div className="bg-white px-4 py-1.5 rounded-full font-bold text-slate-700 shadow-sm whitespace-nowrap border border-slate-100">
            {calculateProgress() === 100 ? 'Sẵn sàng' : 'Đang điền...'}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* CỘT NHẬP LIỆU */}
          <form onSubmit={submit} className="flex-1 space-y-8">
            
            {/* GENERAL PARAMETERS */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-lg border border-white/60 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-lg font-black text-slate-900">General Parameters</h2>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Quantity</span>
                  <select className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer" value={qty} onChange={e => setQty(Number(e.target.value))}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Options</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Text Design Prefix</label>
                  <input type="text" className="w-full rounded-2xl bg-white/80 p-4 border border-white shadow-sm text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder-slate-400" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Insight Context</label>
                  <textarea className="w-full h-24 rounded-2xl bg-white/80 p-4 border border-white shadow-sm text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none placeholder-slate-400" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Storytelling context..." />
                </div>
              </div>
            </div>

            {/* AMAZON DATA */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-lg border border-white/60">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-900">Amazon Data</h2>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Items</span>
                  <select className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {amzItems.map((item, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl p-5 shadow-sm border border-white transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</span>
                    </div>
                    <div className="space-y-3 pl-8">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest w-24 text-center">Title</span>
                        <input className="flex-1 bg-transparent border-b border-slate-200 pb-1 text-sm outline-none focus:border-blue-500 font-medium text-slate-800 placeholder-slate-300" placeholder="Amazon Title..." value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest w-24 text-center mt-1">Desc</span>
                        <textarea className="flex-1 bg-transparent border-b border-slate-200 pb-1 text-sm outline-none resize-none focus:border-blue-500 h-16 font-medium text-slate-800 placeholder-slate-300" placeholder="Description..." value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ETSY DATA */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-lg border border-white/60">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-900">Etsy Data</h2>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Items</span>
                  <select className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {etsyItems.map((item, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl p-5 shadow-sm border border-white transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</span>
                    </div>
                    <div className="space-y-3 pl-8">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest w-24 text-center">Title</span>
                        <input className="flex-1 bg-transparent border-b border-slate-200 pb-1 text-sm outline-none focus:border-pink-500 font-medium text-slate-800 placeholder-slate-300" placeholder="Etsy Title..." value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest w-24 text-center">Tags</span>
                        <input className="flex-1 bg-transparent border-b border-slate-200 pb-1 text-sm outline-none focus:border-pink-500 font-medium text-slate-800 placeholder-slate-300" placeholder="Tags (comma separated)..." value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-full font-black text-white text-lg shadow-xl tracking-widest uppercase transition-all duration-300 ${loading ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50 active:scale-[0.98]'}`}>
              {loading ? 'Đang phân tích...' : '+ Generate Listing'}
            </button>
            {error && <div className="text-center text-red-600 font-bold text-sm bg-red-50/80 backdrop-blur-sm p-4 rounded-full border border-red-200 shadow-sm">{error}</div>}
          </form>

          {/* CỘT KẾT QUẢ */}
          <div className="flex-1">
            <div className="sticky top-8 space-y-6">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/60">
                <h2 className="text-xl font-black text-slate-900 ml-2">Kết quả đầu ra</h2>
                <div className="flex items-center gap-3">
                  {results.length > 0 && (
                    <>
                      <select 
                        className="p-2 px-4 text-xs font-bold text-slate-700 rounded-full border border-slate-200 bg-white shadow-sm cursor-pointer outline-none"
                        value={filterIndex}
                        onChange={(e) => setFilterIndex(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all">Tất cả kết quả</option>
                        {results.map((_, idx) => <option key={idx} value={idx}>Option #{results.length - idx}</option>)}
                      </select>
                      <button onClick={() => {if(confirm('Xóa sạch lịch sử?')){setResults([]); localStorage.removeItem('zazzle_v13.0');}}} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-50 shadow-sm font-bold border border-slate-100">×</button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                {results.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[2rem] border-2 border-dashed border-white/60">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4"><span className="text-2xl opacity-50">📄</span></div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  results.map((v, i) => {
                    if (filterIndex !== 'all' && filterIndex !== i) return null;
                    return (
                      <div key={i} className="p-8 rounded-[2rem] bg-white/80 backdrop-blur-md border border-white shadow-lg relative group transition-all hover:shadow-xl">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black shadow-inner">#{results.length - i}</span>
                            {i === 0 && <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Mới nhất</span>}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="group/item bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase tracking-widest">Title</span>
                              <CopyBtn text={v.newTitle} />
                            </div>
                            <p className="text-lg font-black text-slate-900 leading-snug">{v.newTitle}</p>
                          </div>

                          <div className="group/item bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-2 py-1 rounded uppercase tracking-widest">Description</span>
                              <CopyBtn text={v.newDescription} />
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{v.newDescription}"</p>
                          </div>

                          <div className="group/item bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded uppercase tracking-widest">Tags (10 Unique)</span>
                              <CopyBtn text={v.newTags} />
                            </div>
                            <p className="text-xs font-mono font-bold text-slate-800 tracking-wider break-words">{v.newTags}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}