'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

/* --- ICON COMPONENTS --- */
const AmazonIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 text-slate-800">
    <path d="M257.2 162.7c-36.7-27.4-106.9-28.1-143-5.4-24.4 15.3-35 34-35 56 0 35.8 28.1 59.9 69.6 59.9 44.1 0 71.6-24.3 87.7-42.4.6-1.1 1.6-1.8 2.8-1.8 2.1 0 3.8 1.7 3.8 3.8v43.7c0 23.4 13.5 35 31.6 35 15.5 0 29.1-8.1 34.1-15.3 1.1-1.6 2.8-2.5 4.7-2.5 2.1 0 3.8 1.7 3.8 3.8v6.7c0 14.8-10.4 23.4-25.5 23.4-18.3 0-33.8-12.8-33.8-34.5v-31.8c-18.5 21.8-48.5 43.4-93.5 43.4-56.1 0-101.4-38.3-101.4-94 0-59 48.7-93.5 110.4-93.5 44.1 0 83.2 13.3 111.6 35.4 1.8 1.4 4.5 1.4 6.3 0l21.4-16.4c1.6-1.2 2.3-3.2 1.6-5.1-5.6-14.8-16.4-27.9-30.8-36.9-24.8-15.5-60.6-24.1-100.2-24.1-64.7 0-120.4 25.5-154.5 67.8-25 31.1-39.7 71.6-39.7 114.6 0 44.6 15.3 86.5 41.5 118.6 34.3 42.2 90.7 67.4 156.4 67.4 38.3 0 73.8-8.8 102.3-24.4 14.1-7.7 25.9-17.6 34.8-28.8 1.4-1.8 3.6-2.7 5.8-2.7 2.1 0 4.1.9 5.4 2.5l20.5 25c1.4 1.8 1.4 4.3 0 6.1-23.6 29.5-66.9 49.3-118.4 49.3-71.2 0-131.7-26.6-169.6-70.3-27.4-31.5-43.2-73.8-43.2-119.5 0-47.5 16-89.8 44.3-121.8C89.3 54.3 148.5 27 217.3 27c44.8 0 86 10.4 115.7 27.9 17.6 10.4 32.7 24.3 43.2 41.2 1.4 2.3 1.1 5.4-.9 7.2l-15.8 13.5c-1.8 1.6-4.5 1.6-6.3-.1zm-44.3-15.5c-13.7-10.4-32-16-52.2-16-29.3 0-48.9 12.8-48.9 31.5 0 16 16.4 26.6 40.8 26.6 19.4 0 40.3-9.5 53.6-24.4 3.8-4.3 6.7-9.5 6.7-14.8v-2.9zM207.2 414.2c-54.8 0-112.5-12.8-144.9-30.8-3.4-1.8-6.5-.4-7.2 2.7-4.5 21.3-1.8 46.2 11.2 62.1 27 32.7 88.6 48.9 146.1 48.9 49.8 0 101.4-12.4 135.5-35.4 3.2-2.3 3.6-5.4 1.4-7.9-10.6-12.8-25.7-26.4-44.1-34.5-2.7-1.4-5.8-.4-7.9 1.8-25.5 25-63 39.5-103.5 39.5-6.5.1-13-.2-19.5-1zm141.6-42.9c-2.9 6.7-9.9 8.8-15.3 4.5-25.5-19.6-32.9-22-48.5-31.5-5.6-3.4-5.4-8.1-1.1-12.4 13-13 25-32.5 32-47.8 2.1-4.7 8.3-5.4 12.1-1.4l24.6 28.1c3.1 3.6 4.3 10.4-1 16.4l-11.4 13.1c-13.4 15.3-29.3 27-44.6 37.4l49.3-32.5c2.3-1.6 3.6-1.1 5.4.7 1.4 1.1 16.9 17.6 19.4 20.3 1.6 2.1 1.4 3.8-1.4 5.4l-19.5 12.1z"/>
  </svg>
);

const EtsyIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 text-[#F16521]">
    <path d="M129.5 45.4C108.9 42 77.2 40.8 54 40.8v32h14.5c11.9 0 17.6 2.6 19.3 14.5 1.1 8.8.6 62.1.6 109.8 0 54.5.6 100.4-1.7 106.1-2.8 8-10.2 11.4-23.9 11.9l-8.5.6v33H222V315h-10.8c-15.3-.6-23.3-3.4-27.2-9.7-3.4-5.1-4-23.3-4-81.2v-44.3h22.7c19.3 0 26.1 2.3 31.8 10.2 4.5 6.2 5.1 14.2 6.8 33h31.2V112.5h-31.2c-1.1 17-2.3 25.5-6.8 31.8-4.5 6.2-13.6 9.1-32.4 9.1H179.8v-35.8c0-38.6.6-42 4-46.5 4-5.1 10.8-7.4 26.1-7.4h28.4c34.1 0 51.7 6.2 64.2 23.3 10.8 15.3 14.2 38.6 15.3 84h32.4V40.8H129.5v4.6z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 text-slate-800">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-93.6 20.7-19.2 0-55.6-23.4-86.7-22.9-41.4.6-80 24-100.9 61.2-42.6 75.9-10.9 188.1 30.5 248.5 20.3 29.6 44.5 63 76.2 61.8 30.8-1.2 42.6-20.1 79.5-20.1s47.8 20.1 80 19.5c33.5-.6 53.6-31.5 73.4-61.2 23.3-35 32.7-68.9 33.2-70.6-1.5-.6-46.6-17.7-46.9-57.5zM277.4 69.8c21.8-26.4 36.5-63.2 32.4-99.8-31.1 1.2-69.8 20.8-92.4 47.6-18 21.3-34.9 59.2-30 94.6 34.6 2.7 70.3-18.6 90-42.4z"/>
  </svg>
);

/* --- CUSTOM DROPDOWN COMPONENT --- */
const CustomSelect = ({ value, options, onChange, prefix }: { value: any, options: {label: string, value: any}[], onChange: (val: any) => void, prefix?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between gap-3 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl sm:rounded-full shadow-sm cursor-pointer hover:bg-white transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-slate-800 flex items-center">
          {prefix && <span className="text-slate-500 uppercase text-[10px] mr-2 tracking-widest">{prefix}</span>}
          {selectedOpt.label}
        </span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-full w-max bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl z-50 py-2 overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`px-5 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --- COPY BUTTON --- */
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

/* --- MAIN APP --- */
export default function Ver15Tool() {
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
    const saved = localStorage.getItem('zazzle_v15.0');
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
      localStorage.setItem('zazzle_v15.0', JSON.stringify(newResults));
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
              <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Ver 15.0 • Custom UI & Logos</p>
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
                <CustomSelect 
                  prefix="Quantity"
                  value={qty} 
                  onChange={(val) => setQty(val)}
                  options={[1,2,3,4,5].map(n => ({ label: `${n} Options`, value: n }))} 
                />
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
                  <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                    <AmazonIcon /> Amazon Data
                  </h2>
                  <CustomSelect 
                    value={amzCount} 
                    onChange={(val) => handleAmzCount(val)}
                    options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ label: `${n} Items`, value: n }))} 
                  />
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
                  <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                    <EtsyIcon /> Etsy Data
                  </h2>
                  <CustomSelect 
                    value={etsyCount} 
                    onChange={(val) => handleEtsyCount(val)}
                    options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ label: `${n} Items`, value: n }))} 
                  />
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

          {/* CỘT KẾT QUẢ */}
          <div className="flex-1 w-full xl:w-[55%] flex flex-col mt-6 xl:mt-0 xl:h-[calc(100vh-140px)]">
            <div className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-lg shadow-slate-200/50 border border-white/60 flex flex-col h-full">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                  <AppleIcon /> Kết quả đầu ra
                </h2>
                
                {results.length > 0 && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none">
                      <CustomSelect 
                        value={filterIndex} 
                        onChange={(val) => setFilterIndex(val)}
                        options={[
                          { label: 'Hiển thị Tất cả', value: 'all' },
                          ...results.map((_, idx) => ({ label: `Kết quả #${results.length - idx}`, value: idx }))
                        ]} 
                      />
                    </div>
                    <button onClick={() => {if(confirm('Xóa toàn bộ lịch sử?')){setResults([]); localStorage.removeItem('zazzle_v14.0');}}} className="w-10 h-10 flex items-center justify-center rounded-xl sm:rounded-full bg-white/80 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm font-black border border-white transition-colors" title="Xóa lịch sử">✕</button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
                {results.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-white/60 text-slate-400">
                    <AppleIcon />
                    <p className="font-bold text-sm uppercase tracking-widest text-slate-500 mt-4">Chưa có dữ liệu Listing</p>
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