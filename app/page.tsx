'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

/* --- ICONS --- */
const AmazonIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6 text-slate-800 dark:text-white transition-colors">
    <path d="M257.2 162.7c-36.7-27.4-106.9-28.1-143-5.4-24.4 15.3-35 34-35 56 0 35.8 28.1 59.9 69.6 59.9 44.1 0 71.6-24.3 87.7-42.4.6-1.1 1.6-1.8 2.8-1.8 2.1 0 3.8 1.7 3.8 3.8v43.7c0 23.4 13.5 35 31.6 35 15.5 0 29.1-8.1 34.1-15.3 1.1-1.6 2.8-2.5 4.7-2.5 2.1 0 3.8 1.7 3.8 3.8v6.7c0 14.8-10.4 23.4-25.5 23.4-18.3 0-33.8-12.8-33.8-34.5v-31.8c-18.5 21.8-48.5 43.4-93.5 43.4-56.1 0-101.4-38.3-101.4-94 0-59 48.7-93.5 110.4-93.5 44.1 0 83.2 13.3 111.6 35.4 1.8 1.4 4.5 1.4 6.3 0l21.4-16.4c1.6-1.2 2.3-3.2 1.6-5.1-5.6-14.8-16.4-27.9-30.8-36.9-24.8-15.5-60.6-24.1-100.2-24.1-64.7 0-120.4 25.5-154.5 67.8-25 31.1-39.7 71.6-39.7 114.6 0 44.6 15.3 86.5 41.5 118.6 34.3 42.2 90.7 67.4 156.4 67.4 38.3 0 73.8-8.8 102.3-24.4 14.1-7.7 25.9-17.6 34.8-28.8 1.4-1.8 3.6-2.7 5.8-2.7 2.1 0 4.1.9 5.4 2.5l20.5 25c1.4 1.8 1.4 4.3 0 6.1-23.6 29.5-66.9 49.3-118.4 49.3-71.2 0-131.7-26.6-169.6-70.3-27.4-31.5-43.2-73.8-43.2-119.5 0-47.5 16-89.8 44.3-121.8C89.3 54.3 148.5 27 217.3 27c44.8 0 86 10.4 115.7 27.9 17.6 10.4 32.7 24.3 43.2 41.2 1.4 2.3 1.1 5.4-.9 7.2l-15.8 13.5c-1.8 1.6-4.5 1.6-6.3-.1zm-44.3-15.5c-13.7-10.4-32-16-52.2-16-29.3 0-48.9 12.8-48.9 31.5 0 16 16.4 26.6 40.8 26.6 19.4 0 40.3-9.5 53.6-24.4 3.8-4.3 6.7-9.5 6.7-14.8v-2.9z"/>
  </svg>
);

const EtsyIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6 text-[#F16521]">
    <path d="M129.5 45.4C108.9 42 77.2 40.8 54 40.8v32h14.5c11.9 0 17.6 2.6 19.3 14.5 1.1 8.8.6 62.1.6 109.8 0 54.5.6 100.4-1.7 106.1-2.8 8-10.2 11.4-23.9 11.9l-8.5.6v33H222V315h-10.8c-15.3-.6-23.3-3.4-27.2-9.7-3.4-5.1-4-23.3-4-81.2v-44.3h22.7c19.3 0 26.1 2.3 31.8 10.2 4.5 6.2 5.1 14.2 6.8 33h31.2V112.5h-31.2c-1.1 17-2.3 25.5-6.8 31.8-4.5 6.2-13.6 9.1-32.4 9.1H179.8v-35.8c0-38.6.6-42 4-46.5 4-5.1 10.8-7.4 26.1-7.4h28.4c34.1 0 51.7 6.2 64.2 23.3 10.8 15.3 14.2 38.6 15.3 84h32.4V40.8H129.5v4.6z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6 text-slate-800 dark:text-white transition-colors">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-93.6 20.7-19.2 0-55.6-23.4-86.7-22.9-41.4.6-80 24-100.9 61.2-42.6 75.9-10.9 188.1 30.5 248.5 20.3 29.6 44.5 63 76.2 61.8 30.8-1.2 42.6-20.1 79.5-20.1s47.8 20.1 80 19.5c33.5-.6 53.6-31.5 73.4-61.2 23.3-35 32.7-68.9 33.2-70.6-1.5-.6-46.6-17.7-46.9-57.5zM277.4 69.8c21.8-26.4 36.5-63.2 32.4-99.8-31.1 1.2-69.8 20.8-92.4 47.6-18 21.3-34.9 59.2-30 94.6 34.6 2.7 70.3-18.6 90-42.4z"/>
  </svg>
);

/* --- CUSTOM COMPONENTS --- */
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
        className="flex items-center justify-between gap-3 px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full shadow-sm cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center">
          {prefix && <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] mr-2 tracking-widest">{prefix}</span>}
          {selectedOpt.label}
        </span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-full w-max bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-50 py-2 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
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

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button onClick={copy} className={`text-[10px] md:text-[11px] font-black px-4 py-2 rounded-full transition-all duration-300 border shadow-sm ${ok ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/80 dark:bg-slate-800/80 border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'}`}>
      {ok ? 'ĐÃ COPY ✓' : 'COPY'}
    </button>
  );
};

export default function Ver17Tool() {
  const [isDark, setIsDark] = useState(false);
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
    const savedResults = localStorage.getItem('zazzle_v17.0');
    if (savedResults) setResults(JSON.parse(savedResults));
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
  };

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
      localStorage.setItem('zazzle_v17.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const progress = () => {
    let p = 0;
    if (textDesign) p += 25;
    if (insight) p += 25;
    if (amzItems[0]?.title) p += 25;
    if (etsyItems[0]?.title) p += 25;
    return p;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-[#1e1b4b] dark:to-slate-900 transition-all duration-500 pb-12">
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* HEADER & TOGGLE */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/30">ZA</div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Zazzle SEO Architect</h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Ver 17.0 • Master Protocols</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="px-6 py-3 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg text-sm font-black text-slate-800 dark:text-white flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        {/* PROGRESS BAR */}
        <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-full p-3 px-6 mb-10 flex items-center justify-between border border-white/60 dark:border-white/10 shadow-sm">
          <div className="text-sm font-black text-slate-800 dark:text-slate-200">System Ready: <span className="text-blue-600 dark:text-blue-400">{progress()}%</span></div>
          <div className="h-2.5 w-full max-w-[400px] bg-white/50 dark:bg-slate-800/50 rounded-full mx-8 overflow-hidden shadow-inner">
            <div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-1000 ease-out" style={{ width: `${progress()}%` }} />
          </div>
          <div className="hidden sm:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Protocol status</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* CỘT INPUT */}
          <form onSubmit={submit} className="flex-1 w-full xl:w-[40%] flex flex-col gap-8">
            
            {/* GENERAL (Màu xanh lá nhẹ) */}
            <div className="bg-green-50/60 dark:bg-green-900/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-green-100/50 dark:border-green-500/10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-green-900 dark:text-green-300">General Parameters</h2>
                <CustomSelect prefix="Output" value={qty} onChange={setQty} options={[1,2,3,4,5].map(n => ({label: `${n} Variants`, value: n}))} />
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-green-700/60 dark:text-green-500 uppercase tracking-widest mb-2 ml-2">Prefix Design</label>
                  <input type="text" className="w-full rounded-2xl bg-white/80 dark:bg-slate-800/80 p-4 border border-white dark:border-white/10 text-sm font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-400 transition-all" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-green-700/60 dark:text-green-500 uppercase tracking-widest mb-2 ml-2">Insight context</label>
                  <textarea className="w-full h-28 rounded-2xl bg-white/80 dark:bg-slate-800/80 p-4 border border-white dark:border-white/10 text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Blog details..." />
                </div>
              </div>
            </div>

            {/* AMAZON & ETSY */}
            <div className="space-y-8">
              {/* AMAZON */}
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/60 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><AmazonIcon /> Amazon Data</h2>
                  <CustomSelect value={amzCount} onChange={handleAmzCount} options={[1,2,3,4,5,6,7,8,9,10].map(n => ({label: `${n} Items`, value: n}))} />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {amzItems.map((item, i) => (
                    <div key={i} className="bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 border border-white dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center">{i+1}</span> Amazon product</div>
                      <input className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 pb-2 text-sm font-black text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} placeholder="Title" />
                      <textarea className="w-full bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none h-16 mt-3 resize-none" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} placeholder="Description" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ETSY */}
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/60 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3"><EtsyIcon /> Etsy Data</h2>
                  <CustomSelect value={etsyCount} onChange={handleEtsyCount} options={[1,2,3,4,5,6,7,8,9,10].map(n => ({label: `${n} Items`, value: n}))} />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {etsyItems.map((item, i) => (
                    <div key={i} className="bg-white/60 dark:bg-slate-800/60 rounded-3xl p-6 border border-white dark:border-white/5 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-5 h-5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center">{i+1}</span> Etsy product</div>
                      <input className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 pb-2 text-sm font-black text-slate-800 dark:text-white outline-none focus:border-pink-500 transition-all" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} placeholder="Title" />
                      <input className="w-full bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 outline-none mt-3" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} placeholder="Tags (comma separated)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-full font-black text-lg text-white shadow-2xl transition-all ${loading ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/40 active:scale-[0.98]'}`}>
              {loading ? 'Processing through Groq LPU...' : 'Generate SEO Architecture'}
            </button>
            {error && <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center font-bold border border-red-200 dark:border-red-800">{error}</div>}
          </form>

          {/* CỘT KẾT QUẢ (Full Height) */}
          <div className="flex-1 w-full xl:w-[60%] xl:h-[calc(100vh-160px)] flex flex-col">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/60 dark:border-white/10 h-full flex flex-col">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/60 dark:bg-slate-800/60 p-5 rounded-3xl border border-white/50 dark:border-white/10">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4"><AppleIcon /> Kết quả đầu ra</h2>
                {results.length > 0 && (
                  <div className="flex items-center gap-4">
                    <CustomSelect value={filterIndex} onChange={setFilterIndex} options={[{label: 'Tất cả kết quả', value: 'all'}, ...results.map((_, idx) => ({label: `Kết quả #${results.length - idx}`, value: idx}))]} />
                    <button onClick={() => {if(confirm('Wipe history?')){setResults([]); localStorage.removeItem('zazzle_v17.0');}}} className="w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-slate-700/80 text-red-500 rounded-full font-black border border-white dark:border-white/10 shadow-sm">✕</button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-10">
                {results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white/20 dark:bg-black/10 rounded-[3rem] border-2 border-dashed border-white/40 dark:border-slate-800">
                    <AppleIcon />
                    <p className="mt-4 font-black uppercase text-xs tracking-widest">Protocol inactive. Input data to start.</p>
                  </div>
                ) : (
                  results.map((v, i) => {
                    if (filterIndex !== 'all' && filterIndex !== i) return null;
                    return (
                      <div key={i} className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white dark:border-white/10 shadow-lg relative group transition-all hover:shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black">#{results.length - i}</span>
                            {i === 0 && <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Protocol Latest</span>}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-slate-50/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg uppercase tracking-widest">SEO Title</span>
                              <CopyBtn text={v.newTitle} />
                            </div>
                            <p className="text-xl font-black text-slate-800 dark:text-white leading-tight">{v.newTitle}</p>
                          </div>

                          <div className="bg-slate-50/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-lg uppercase tracking-widest">Storytelling Desc</span>
                              <CopyBtn text={v.newDescription} />
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{v.newDescription}"</p>
                          </div>

                          <div className="bg-slate-50/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-lg uppercase tracking-widest">Unique Tags (10)</span>
                              <CopyBtn text={v.newTags} />
                            </div>
                            <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 break-words tracking-wider">{v.newTags}</p>
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