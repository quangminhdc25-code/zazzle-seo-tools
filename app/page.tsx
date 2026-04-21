'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); };
  return (
    <button onClick={copy} className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${ok ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow'}`}>
      {ok ? '✓ COPIED' : 'COPY'}
    </button>
  );
};

export default function Ver81Tool() {
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

  useEffect(() => {
    const saved = localStorage.getItem('zazzle_v8.1');
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
    if (!textDesign) return setError('Vui lòng nhập Text Design!');
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
      localStorage.setItem('zazzle_v8.1', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const clearHistory = () => {
    if(confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) { setResults([]); localStorage.removeItem('zazzle_v8.1'); }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 p-6 lg:p-10 text-slate-800 font-sans selection:bg-pink-200">
      
      <header className="mb-12 flex flex-col items-center">
        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 pb-2">
          ZAZZLE SEO <span className="font-light">ARCHITECT</span>
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ver 8.1 • Secured Groq Engine</p>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-10 max-w-[1600px] mx-auto">
        
        {/* INPUT COLUMN */}
        <form onSubmit={submit} className="flex-1 space-y-8 bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-3xl border border-pink-100/50 shadow-inner">
            <div>
              <label className="text-[10px] font-black text-pink-700 uppercase tracking-wider block mb-2">Text Design (Tiền tố Title)</label>
              <input type="text" className="w-full p-4 rounded-2xl border-none shadow-sm text-sm font-bold bg-white focus:ring-2 focus:ring-pink-300 outline-none transition-all" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="VD: Retro Cat Mama..." />
            </div>
            <div>
              <label className="text-[10px] font-black text-purple-700 uppercase tracking-wider block mb-2">Số lượng biến thể</label>
              <select className="w-full p-4 rounded-2xl border-none shadow-sm text-sm font-bold bg-white focus:ring-2 focus:ring-purple-300 outline-none transition-all cursor-pointer" value={qty} onChange={e => setQty(Number(e.target.value))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>Tạo {n} Option</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">Insight Context / Bài viết nền</label>
            <textarea className="w-full h-36 p-5 rounded-3xl bg-slate-50/50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all placeholder:text-slate-400 resize-none" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Dán bài blog, phân tích insight khách hàng vào đây để AI viết mô tả kể chuyện (Storytelling)..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AMZ BOX */}
            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 relative overflow-hidden group transition-all hover:bg-orange-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-transparent opacity-20 rounded-bl-full pointer-events-none"></div>
              <div className="flex justify-between items-center mb-5 relative z-10">
                <label className="text-[10px] font-black text-orange-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 bg-orange-200 rounded-lg text-orange-700">📦</span> Amazon Data
                </label>
                <select className="text-[10px] p-2 border-none rounded-xl bg-white shadow-sm font-bold text-orange-700 cursor-pointer outline-none" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {amzItems.map((item, i) => (
                  <div key={i} className="space-y-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white group-hover:border-orange-200 transition-colors">
                    <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Item {i+1}</div>
                    <input className="w-full p-2 text-xs border-b border-slate-100 outline-none focus:border-orange-400 bg-transparent transition-colors" placeholder="Amazon Title..." value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                    <textarea className="w-full h-16 p-2 text-xs outline-none bg-transparent resize-none" placeholder="Amazon Description..." value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ETSY BOX */}
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 relative overflow-hidden group transition-all hover:bg-amber-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-transparent opacity-20 rounded-bl-full pointer-events-none"></div>
              <div className="flex justify-between items-center mb-5 relative z-10">
                <label className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 bg-amber-200 rounded-lg text-amber-700">🎨</span> Etsy Data
                </label>
                <select className="text-[10px] p-2 border-none rounded-xl bg-white shadow-sm font-bold text-amber-700 cursor-pointer outline-none" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {etsyItems.map((item, i) => (
                  <div key={i} className="space-y-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white group-hover:border-amber-200 transition-colors">
                    <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Item {i+1}</div>
                    <input className="w-full p-2 text-xs border-b border-slate-100 outline-none focus:border-amber-400 bg-transparent transition-colors" placeholder="Etsy Title..." value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                    <input className="w-full p-2 text-xs outline-none bg-transparent" placeholder="Tags (ngăn cách bằng dấu phẩy)..." value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-3xl font-black text-white tracking-[0.2em] uppercase transition-all duration-300 shadow-xl ${loading ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-95'}`}>
            {loading ? 'Đang phân tích dữ liệu (Groq LPU)...' : 'Khởi tạo SEO Listing'}
          </button>
          
          {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center text-red-600 font-bold text-sm shadow-inner">{error}</div>}
        </form>

        {/* OUTPUT COLUMN */}
        <div className="flex-1">
          <div className="sticky top-10">
            <div className="flex justify-between items-center mb-6 px-2">
               <h2 className="text-2xl font-black tracking-tight text-slate-800">Kết quả đầu ra</h2>
               {results.length > 0 && <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-bold flex items-center gap-1"><span className="text-lg leading-none">×</span> Xóa lịch sử</button>}
            </div>
            
            <div className="space-y-8 h-[82vh] overflow-y-auto pr-4 custom-scrollbar pb-20">
              {results.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300/50 bg-white/40 rounded-[3rem] text-slate-400">
                  <div className="text-6xl mb-4 opacity-50">✨</div>
                  <p className="font-bold text-sm uppercase tracking-widest">Chưa có dữ liệu</p>
                </div>
              )}
              
              {results.map((v, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                  {i === 0 && <div className="absolute top-0 right-10 bg-gradient-to-b from-pink-500 to-pink-600 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-lg shadow-pink-500/30 tracking-widest">NEW</div>}
                  
                  <div className="space-y-6">
                    <div className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Zazzle Title</span>
                        <CopyBtn text={v.newTitle} />
                      </div>
                      <p className="text-xl font-black text-slate-800 leading-snug">{v.newTitle}</p>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>

                    <div className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Description</span>
                        <CopyBtn text={v.newDescription} />
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {v.newDescription}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl shadow-inner border border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SEO Tags (10 Unique)</span>
                        <CopyBtn text={v.newTags} />
                      </div>
                      <p className="text-sm font-mono font-bold text-slate-200 tracking-wide leading-relaxed">
                        {v.newTags}
                      </p>
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