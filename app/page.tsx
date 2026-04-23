'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

/* --- ICONS --- */
const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 text-slate-800 dark:text-slate-100 transition-colors"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-93.6 20.7-19.2 0-55.6-23.4-86.7-22.9-41.4.6-80 24-100.9 61.2-42.6 75.9-10.9 188.1 30.5 248.5 20.3 29.6 44.5 63 76.2 61.8 30.8-1.2 42.6-20.1 79.5-20.1s47.8 20.1 80 19.5c33.5-.6 53.6-31.5 73.4-61.2 23.3-35 32.7-68.9 33.2-70.6-1.5-.6-46.6-17.7-46.9-57.5zM277.4 69.8c21.8-26.4 36.5-63.2 32.4-99.8-31.1 1.2-69.8 20.8-92.4 47.6-18 21.3-34.9 59.2-30 94.6 34.6 2.7 70.3-18.6 90-42.4z"/></svg>
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
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-white/70 dark:bg-[#3a3a3c]/70 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-full shadow-sm cursor-pointer hover:bg-white dark:hover:bg-[#48484a] transition-all select-none" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center">{prefix && <span className="text-slate-500 dark:text-slate-400 uppercase text-[9px] mr-1.5 tracking-wider">{prefix}</span>}{selectedOpt.label}</span>
        <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 min-w-full w-max bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div key={opt.value} className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#3a3a3c]'}`} onClick={() => { onChange(opt.value); setIsOpen(false); }}>{opt.label}</div>
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
    <button onClick={copy} className={`text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded-full transition-all duration-300 border shadow-sm ${ok ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/80 dark:bg-[#3a3a3c]/80 border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#48484a]'}`}>{ok ? 'ĐÃ COPY ✓' : 'COPY'}</button>
  );
};

export default function Ver19Tool() {
  const [isDark, setIsDark] = useState(false);
  const [qty, setQty] = useState(1);
  const [textDesign, setTextDesign] = useState('');
  
  // Structured Insight States
  const [targetAudience, setTargetAudience] = useState('');
  const [coreEmotion, setCoreEmotion] = useState('Nostalgia');
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState('Storytelling');
  const [valueProp, setValueProp] = useState('');

  const [amzCount, setAmzCount] = useState(1);
  const [amzItems, setAmzItems] = useState<AmazonItem[]>([{ title: '', description: '' }]);
  const [etsyCount, setEtsyCount] = useState(1);
  const [etsyItems, setEtsyItems] = useState<EtsyItem[]>([{ title: '', tags: '' }]);
  const [results, setResults] = useState<ZazzleVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterIndex, setFilterIndex] = useState<number | 'all'>('all');

  useEffect(() => {
    const savedResults = localStorage.getItem('zazzle_v19.0');
    if (savedResults) setResults(JSON.parse(savedResults));
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) { setIsDark(true); document.documentElement.classList.add('dark'); } 
    else { setIsDark(false); document.documentElement.classList.remove('dark'); }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleAmzCount = (n: number) => {
    setAmzCount(n);
    setAmzItems(prev => { const next = [...prev]; while(next.length < n) next.push({ title: '', description: '' }); return next.slice(0, n); });
  };

  const handleEtsyCount = (n: number) => {
    setEtsyCount(n);
    setEtsyItems(prev => { const next = [...prev]; while(next.length < n) next.push({ title: '', tags: '' }); return next.slice(0, n); });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textDesign) return setError('Vui lòng nhập Prefix Design.');
    if (!targetAudience) return setError('Vui lòng nhập Target Audience (Bắt buộc).');
    setLoading(true); setError('');
    try {
      const payload = { amazonItems: amzItems, etsyItems: etsyItems, textDesign, quantity: qty, targetAudience, coreEmotion, situation, tone, valueProp };
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newResults = [...data.variants, ...results].slice(0, 50);
      setResults(newResults);
      setFilterIndex('all');
      localStorage.setItem('zazzle_v19.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const progress = () => {
    let p = 0;
    if (textDesign) p += 20;
    if (targetAudience) p += 20;
    if (situation) p += 20;
    if (amzItems[0]?.title) p += 20;
    if (etsyItems[0]?.title) p += 20;
    return p;
  };

  const emotionOptions = [
    { label: 'Nostalgic (Hoài niệm)', value: 'Nostalgic' },
    { label: 'Sarcastic Humor (Hài hước mỉa mai)', value: 'Sarcastic Humor' },
    { label: 'Inspirational (Truyền cảm hứng)', value: 'Inspirational' },
    { label: 'Professional (Chuyên nghiệp)', value: 'Professional' },
    { label: 'Heartwarming (Ấm áp, tình cảm)', value: 'Heartwarming' }
  ];

  const toneOptions = [
    { label: 'Storytelling (Kể chuyện)', value: 'Storytelling' },
    { label: 'Witty & Sharp (Thông minh, sắc sảo)', value: 'Witty & Sharp' },
    { label: 'Whimsical & Dreamy (Bay bổng)', value: 'Whimsical & Dreamy' },
    { label: 'Bold & Direct (Mạnh mẽ, trực tiếp)', value: 'Bold & Direct' }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f5f5f7] via-[#ebedf0] to-[#e2e4e8] dark:from-[#1c1c1e] dark:via-[#2c2c2e] dark:to-[#1c1c1e] transition-all duration-300 text-slate-900 dark:text-slate-100 pb-8">
      <div className="w-full max-w-[1500px] mx-auto p-4 md:p-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20">ZA</div>
            <div><h1 className="text-xl md:text-2xl font-bold tracking-tight">Zazzle SEO Architect</h1><p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ver 19.0 • Structured Insight</p></div>
          </div>
          <button onClick={toggleTheme} className="px-4 py-2 rounded-full bg-white/60 dark:bg-[#2c2c2e]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-sm text-xs font-bold flex items-center gap-2 hover:bg-white dark:hover:bg-[#3a3a3c] transition-all">{isDark ? '☀️ Light' : '🌙 Dark'}</button>
        </header>

        {/* PROGRESS */}
        <div className="bg-white/50 dark:bg-[#2c2c2e]/50 backdrop-blur-md rounded-full p-2.5 px-5 mb-6 flex items-center justify-between border border-slate-200/50 dark:border-white/10 shadow-sm text-xs">
          <div className="font-bold">Thiết lập: <span className="text-blue-600 dark:text-blue-400">{progress()}%</span></div>
          <div className="h-1.5 w-full max-w-[300px] bg-slate-200/50 dark:bg-[#1c1c1e] rounded-full mx-6 overflow-hidden"><div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-700 ease-out" style={{ width: `${progress()}%` }} /></div>
          <div className="hidden sm:block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trạng thái</div>
        </div>

        <div className="flex flex-col xl:flex-row gap-5 items-start">
          
          {/* CỘT INPUT */}
          <form onSubmit={submit} className="flex-1 w-full xl:w-[40%] flex flex-col gap-5">
            
            {/* GENERAL & STRUCTURED INSIGHT */}
            <div className="bg-white/50 dark:bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/10">
              <div className="flex justify-between items-center mb-5 border-b border-slate-200/50 dark:border-slate-700 pb-4">
                <h2 className="text-base font-bold text-blue-600 dark:text-blue-400">Structured Insight Setup</h2>
                <CustomSelect prefix="Output" value={qty} onChange={setQty} options={[1,2,3,4,5].map(n => ({label: `${n} Variants`, value: n}))} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Prefix Design <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full rounded-xl bg-white/70 dark:bg-[#1c1c1e]/70 p-2.5 border border-slate-200/50 dark:border-white/5 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-400 transition-colors placeholder-slate-400" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Target Audience <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full rounded-xl bg-white/70 dark:bg-[#1c1c1e]/70 p-2.5 border border-slate-200/50 dark:border-white/5 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-400 transition-colors placeholder-slate-400" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g. Introverted Nurses" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Core Emotion <span className="text-red-500">*</span></label>
                    <div className="w-full"><CustomSelect value={coreEmotion} onChange={setCoreEmotion} options={emotionOptions} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Situation (Optional)</label>
                    <input type="text" className="w-full rounded-xl bg-white/70 dark:bg-[#1c1c1e]/70 p-2.5 border border-slate-200/50 dark:border-white/5 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-400 transition-colors placeholder-slate-400" value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g. Night shift survival" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Tone (Optional)</label>
                    <div className="w-full"><CustomSelect value={tone} onChange={setTone} options={toneOptions} /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Value Proposition (Optional)</label>
                  <input type="text" className="w-full rounded-xl bg-white/70 dark:bg-[#1c1c1e]/70 p-2.5 border border-slate-200/50 dark:border-white/5 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-400 transition-colors placeholder-slate-400" value={valueProp} onChange={e => setValueProp(e.target.value)} placeholder="e.g. Funny typography gift" />
                </div>
              </div>
            </div>

            {/* AMAZON & ETSY */}
            <div className="space-y-5">
              <div className="bg-white/50 dark:bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/10">
                <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold">Amazon Data</h2><CustomSelect value={amzCount} onChange={handleAmzCount} options={[1,2,3,4,5,6,7,8,9,10].map(n => ({label: `${n} Items`, value: n}))} /></div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {amzItems.map((item, i) => (
                    <div key={i} className="bg-white/70 dark:bg-[#1c1c1e]/50 rounded-xl p-4 border border-slate-200/50 dark:border-white/5 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amazon Product #{i+1}</div>
                      <input className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1.5 text-sm font-semibold outline-none focus:border-blue-500 transition-colors placeholder-slate-400" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} placeholder="Title" />
                      <textarea className="w-full bg-transparent text-sm font-medium outline-none min-h-[60px] mt-2 resize-y placeholder-slate-400 custom-scrollbar" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} placeholder="Description (Kéo góc phải để mở rộng)" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 dark:bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/10">
                <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold">Etsy Data</h2><CustomSelect value={etsyCount} onChange={handleEtsyCount} options={[1,2,3,4,5,6,7,8,9,10].map(n => ({label: `${n} Items`, value: n}))} /></div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {etsyItems.map((item, i) => (
                    <div key={i} className="bg-white/70 dark:bg-[#1c1c1e]/50 rounded-xl p-4 border border-slate-200/50 dark:border-white/5 shadow-sm">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Etsy Product #{i+1}</div>
                      <input className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1.5 text-sm font-semibold outline-none focus:border-blue-500 transition-colors placeholder-slate-400" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} placeholder="Title" />
                      <input className="w-full bg-transparent text-sm font-medium outline-none mt-2 placeholder-slate-400" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} placeholder="Tags (comma separated)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${loading ? 'bg-slate-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'}`}>
              {loading ? 'Processing via LPU...' : 'Generate Listing'}
            </button>
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-center font-semibold text-xs border border-red-200 dark:border-red-800/50">{error}</div>}
          </form>

          {/* CỘT KẾT QUẢ */}
          <div className="flex-1 w-full xl:w-[60%] xl:sticky xl:top-6 flex flex-col xl:h-[calc(100vh-48px)]">
            <div className="bg-white/50 dark:bg-[#2c2c2e]/60 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/10 h-full flex flex-col">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200/50 dark:border-slate-700">
                <h2 className="text-lg font-bold flex items-center gap-2"><AppleIcon /> Kết quả đầu ra</h2>
                {results.length > 0 && (
                  <div className="flex items-center gap-3">
                    <CustomSelect value={filterIndex} onChange={setFilterIndex} options={[{label: 'Tất cả', value: 'all'}, ...results.map((_, idx) => ({label: `Kết quả #${results.length - idx}`, value: idx}))]} />
                    <button onClick={() => {if(confirm('Xóa lịch sử?')){setResults([]); localStorage.removeItem('zazzle_v19.0');}}} className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-[#3a3a3c] text-red-500 rounded-full font-bold border border-slate-200/50 dark:border-white/10 shadow-sm text-xs hover:bg-red-50 dark:hover:bg-red-900/20">✕</button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-8">
                {results.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 bg-white/30 dark:bg-[#1c1c1e]/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"><AppleIcon /><p className="mt-3 font-semibold text-xs uppercase tracking-widest">Chưa có dữ liệu</p></div>
                ) : (
                  results.map((v, i) => {
                    if (filterIndex !== 'all' && filterIndex !== i) return null;
                    return (
                      <div key={i} className="p-5 md:p-6 rounded-2xl bg-white/80 dark:bg-[#3a3a3c]/60 backdrop-blur-md border border-slate-200/50 dark:border-white/5 shadow-sm relative group transition-all">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <div className="flex items-center gap-3"><span className="text-sm font-bold text-blue-600 dark:text-blue-400">#{results.length - i}</span>{i === 0 && <span className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Mới nhất</span>}</div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-slate-50/80 dark:bg-[#2c2c2e]/60 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Title</span><CopyBtn text={v.newTitle} /></div>
                            <p className="text-base font-bold leading-tight">{v.newTitle}</p>
                          </div>
                          <div className="bg-slate-50/80 dark:bg-[#2c2c2e]/60 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</span><CopyBtn text={v.newDescription} /></div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{v.newDescription}</p>
                          </div>
                          <div className="bg-slate-50/80 dark:bg-[#2c2c2e]/60 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tags (10)</span><CopyBtn text={v.newTags} /></div>
                            <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 break-words">{v.newTags}</p>
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