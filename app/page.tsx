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
      className={`text-[10px] md:text-[11px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300 border shadow-sm flex items-center justify-center min-w-[80px] ${
        ok 
        ? 'bg-blue-600 border-blue-600 text-white' 
        : 'bg-white/80 border-white/50 text-slate-700 hover:bg-white hover:shadow-md'
      }`}
    >
      {ok ? 'ĐÃ COPY ✓' : 'COPY'}
    </button>
  );
};

// SVG Mũi tên tùy chỉnh cho thẻ Select
const selectCaret = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`;

export default function Ver14Tool() {
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
    const saved = localStorage.getItem('zazzle_v14.0');
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
      localStorage.setItem('zazzle_v14.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const calculateProgress = () => {
    let filled = 0;
    if (textDesign) filled += 25;
    if (insight) filled += 25;
    if (amzItems[0]?.title) filled += 25;
    if (etsyItems[0]?.title) filled += 25;
    return filled;
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 selection:bg-blue-200 selection:text-blue-900 pb-10">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        
        {/* HEADER */}
        <header className="mb-6 md:mb-8 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/30">ZA</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Zazzle SEO Architect</h1>
              <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Ver 14.0 • Responsive Glass</p>
            </div>
          </div>
        </header>

        {/* PROGRESS BAR */}
        <div className="bg-white/40 backdrop-blur-md rounded-full p-2 md:p-3 px-4 md:px-6 text-xs md:text-sm mb-6 md:mb-8 flex items-center justify-between shadow-sm border border-white/60">
          <div className="text-slate-700 font-bold whitespace-nowrap hidden sm:block">Tiến độ thiết lập:</div>
          <div className="h-2 w-full max-w-[100px] sm:max-w-none bg-white/50 rounded-full flex-grow mx-4 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
          <div className="bg-white/80 px-3 md:px-5 py-1.5 rounded-full font-bold text-slate-700 shadow-sm whitespace-nowrap border border-white">
            {calculateProgress()}% {calculateProgress() === 100 ? 'Sẵn sàng 🚀' : ''}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full">
          
          {/* CỘT INPUT */}
          <form onSubmit={submit} className="flex-1 w-full xl:w-[45%] flex flex-col gap-6">
            
            {/* GENERAL */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-lg shadow-slate-200/50 border border-white/60">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                <h2 className="text-lg md:text-xl font-black text-slate-800">General Parameters</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto bg-white/60 px-4 py-2 rounded-xl sm:rounded-full border border-white/50">
                  <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Quantity</span>
                  <select 
                    className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer appearance-none w-full sm:w-auto pr-6" 
                    style={{ backgroundImage: selectCaret, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.2em' }}
                    value={qty} onChange={e => setQty(Number(e.target.value))}
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Options</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Text Design Prefix <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full rounded-xl md:rounded-2xl bg-white/70 p-3 md:p-4 border border-white shadow-sm text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder-slate-400" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Vintage Cat Mama" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Insight Context</label>
                  <textarea className="w-full h-24 md:h-28 rounded-xl md:rounded-2xl bg-white/70 p-3 md:p-4 border border-white shadow-sm text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none placeholder-slate-400" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Storytelling context..." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              {/* AMAZON */}
              <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-lg shadow-slate-200/50 border border-white/60 flex flex-col h-full max-h-[500px]">
                <div className="flex justify-between items-center mb-5 gap-2">
                  <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-xl">📦</span> Amazon</h2>
                  <select 
                    className="bg-white/60 border border-white/50 text-sm font-bold text-slate-800 outline-none cursor-pointer appearance-none px-4 py-2 rounded-xl sm:rounded-full shadow-sm pr-8"
                    style={{ backgroundImage: selectCaret, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '1.2em' }}
                    value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-2">
                  {amzItems.map((item, i) => (
                    <div key={i} className="bg-white/60 rounded-xl p-4 shadow-sm border border-white/50 transition-all hover:bg-white hover:shadow-md">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">{i+1}</span> Product Info
                      </div>
                      <div className="space-y-3">
                        <input className="w-full bg-transparent border-b border-slate-300 pb-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="Amazon Title..." value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                        <textarea className="w-full bg-transparent border-b border-slate-300 pb-2 text-sm font-medium text-slate-800 outline-none resize-none focus:border-blue-500 h-16 placeholder-slate-400" placeholder="Description..." value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ETSY */}
              <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-lg shadow-slate-200/50 border border-white/60 flex flex-col h-full max-h-[500px]">
                <div className="flex justify-between items-center mb-5 gap-2">
                  <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-xl">🎨</span> Etsy</h2>
                  <select 
                    className="bg-white/60 border border-white/50 text-sm font-bold text-slate-800 outline-none cursor-pointer appearance-none px-4 py-2 rounded-xl sm:rounded-full shadow-sm pr-8"
                    style={{ backgroundImage: selectCaret, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '1.2em' }}
                    value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-2">
                  {etsyItems.map((item, i) => (
                    <div key={i} className="bg-white/60 rounded-xl p-4 shadow-sm border border-white/50 transition-all hover:bg-white hover:shadow-md">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">{i+1}</span> Product Info
                      </div>
                      <div className="space-y-3">
                        <input className="w-full bg-transparent border-b border-slate-300 pb-2 text-sm font-medium text-slate-800 outline-none focus:border-pink-500 placeholder-slate-400" placeholder="Etsy Title..." value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                        <input className="w-full bg-transparent border-b border-slate-300 pb-2 text-sm font-medium text-slate-800 outline-none focus:border-pink-500 placeholder-slate-400" placeholder="Tags (comma separated)..." value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="sticky bottom-4 z-20">
              <button type="submit" disabled={loading} className={`w-full py-4 md:py-5 rounded-2xl md:rounded-full font-black text-white text-base md:text-lg shadow-xl shadow-blue-500/30 uppercase tracking-widest transition-all duration-300 ${loading ? 'bg-slate-400 cursor-wait shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.01] active:scale-[0.98]'}`}>
                {loading ? 'Đang phân tích dữ liệu...' : '+ Generate Listing'}
              </button>
            </div>
            {error && <div className="text-center text-red-600 font-bold text-sm bg-red-50/90 backdrop-blur-md p-4 rounded-2xl border border-red-200 shadow-sm">{error}</div>}
          </form>

          {/* CỘT KẾT QUẢ (Tận dụng màn hình) */}
          <div className="flex-1 w-full xl:w-[55%] flex flex-col mt-6 xl:mt-0 xl:h-[calc(100vh-140px)]">
            <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-lg shadow-slate-200/50 border border-white/60 flex flex-col h-full">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Kết quả đầu ra
                </h2>
                
                {results.length > 0 && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select 
                      className="flex-1 sm:flex-none p-2.5 px-5 text-sm font-bold text-slate-700 rounded-xl sm:rounded-full border border-white bg-white/80 shadow-sm cursor-pointer outline-none appearance-none pr-10 hover:bg-white transition-colors"
                      style={{ backgroundImage: selectCaret, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '1.2em' }}
                      value={filterIndex}
                      onChange={(e) => setFilterIndex(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                      <option value="all">Hiển thị Tất cả</option>
                      {results.map((_, idx) => <option key={idx} value={idx}>Kết quả #{results.length - idx}</option>)}
                    </select>
                    <button onClick={() => {if(confirm('Xóa toàn bộ lịch sử?')){setResults([]); localStorage.removeItem('zazzle_v14.0');}}} className="w-10 h-10 flex items-center justify-center rounded-xl sm:rounded-full bg-white/80 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm font-black border border-white transition-colors" title="Xóa lịch sử">✕</button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
                {results.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-white/60 text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>
                    <p className="font-bold text-sm uppercase tracking-widest text-slate-500">Chưa có dữ liệu Listing</p>
                    <p className="text-xs mt-2 text-slate-400">Điền thông tin và nhấn Generate để bắt đầu</p>
                  </div>
                ) : (
                  results.map((v, i) => {
                    if (filterIndex !== 'all' && filterIndex !== i) return null;
                    return (
                      <div key={i} className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/80 backdrop-blur-md border border-white shadow-md relative group transition-all hover:shadow-lg">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl md:rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-black shadow-inner">#{results.length - i}</span>
                            {i === 0 && <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black px-3 py-1.5 rounded-md md:rounded-full uppercase tracking-widest shadow-sm">Mới nhất</span>}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start md:items-center mb-3 flex-col md:flex-row gap-2">
                              <span className="text-[10px] md:text-xs font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md uppercase tracking-widest">Title</span>
                              <CopyBtn text={v.newTitle} />
                            </div>
                            <p className="text-lg md:text-xl font-black text-slate-800 leading-snug">{v.newTitle}</p>
                          </div>

                          <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start md:items-center mb-3 flex-col md:flex-row gap-2">
                              <span className="text-[10px] md:text-xs font-black bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md uppercase tracking-widest">Description</span>
                              <CopyBtn text={v.newDescription} />
                            </div>
                            <p className="text-sm md:text-base font-medium text-slate-600 leading-relaxed italic">"{v.newDescription}"</p>
                          </div>

                          <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-start md:items-center mb-3 flex-col md:flex-row gap-2">
                              <span className="text-[10px] md:text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md uppercase tracking-widest">Tags (10 Unique)</span>
                              <CopyBtn text={v.newTags} />
                            </div>
                            <p className="text-sm md:text-base font-mono font-bold text-slate-700 tracking-wider break-words leading-relaxed">{v.newTags}</p>
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