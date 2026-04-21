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
      className={`text-[11px] font-semibold px-4 py-1.5 rounded-md transition-all duration-200 border ${
        ok 
        ? 'bg-[#005FB8] border-[#005FB8] text-white' 
        : 'bg-white dark:bg-[#2c2c2c] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#323232]'
      }`}
    >
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function Ver12Tool() {
  const [darkMode, setDarkMode] = useState(false);
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
    const saved = localStorage.getItem('zazzle_v12.0');
    if (saved) setResults(JSON.parse(saved));
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
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
    if (!textDesign) return setError('Vui lòng nhập Text Design.');
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
      localStorage.setItem('zazzle_v12.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={`${darkMode ? 'dark bg-[#1c1c1c]' : 'bg-[#f3f3f3]'} w-full min-h-screen font-sans transition-colors duration-300`}>
      <div className="max-w-[1200px] mx-auto p-6 lg:p-10 space-y-8">
        
        {/* HEADER & THEME TOGGLE */}
        <header className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Zazzle SEO Architect</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ver 12.0 • Windows 11 Vertical Fluent</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-[#323232] transition-all"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        {/* INPUT FORM */}
        <form onSubmit={submit} className="space-y-6">
          
          {/* GENERAL PARAMETERS (LIGHT GREEN) */}
          <div className="p-8 rounded-xl bg-[#f0fdf4] dark:bg-[#142a1a] border border-[#dcfce7] dark:border-[#1e3a24] shadow-sm">
            <h2 className="text-base font-bold mb-6 text-[#166534] dark:text-[#4ade80] uppercase tracking-wider">General Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase">Text Design Prefix</label>
                <input type="text" className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] text-sm focus:ring-2 focus:ring-[#005FB8] outline-none" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Vintage Cat Mom" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase">Quantity</label>
                <select className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] text-sm focus:ring-2 focus:ring-[#005FB8] outline-none cursor-pointer" value={qty} onChange={e => setQty(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Variants</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase">Insight Context</label>
              <textarea className="w-full h-28 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] text-sm focus:ring-2 focus:ring-[#005FB8] outline-none resize-none" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Storytelling context..." />
            </div>
          </div>

          {/* AMAZON DATA (FULL WIDTH) */}
          <div className="p-8 rounded-xl bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Amazon Data</h2>
              <select className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] cursor-pointer" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Products</option>)}
              </select>
            </div>
            <div className="space-y-4">
              {amzItems.map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-[#242424] border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Amazon Item #{i+1}</span>
                  <input className="w-full p-2 bg-transparent border-b border-gray-200 dark:border-gray-700 text-sm outline-none" placeholder="Product Title" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                  <textarea className="w-full h-16 p-2 bg-transparent text-sm outline-none resize-none" placeholder="Product Description" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                </div>
              ))}
            </div>
          </div>

          {/* ETSY DATA (FULL WIDTH) */}
          <div className="p-8 rounded-xl bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Etsy Data</h2>
              <select className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#242424] cursor-pointer" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Products</option>)}
              </select>
            </div>
            <div className="space-y-4">
              {etsyItems.map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-[#242424] border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Etsy Item #{i+1}</span>
                  <input className="w-full p-2 bg-transparent border-b border-gray-200 dark:border-gray-700 text-sm outline-none" placeholder="Product Title" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                  <input className="w-full p-2 bg-transparent text-sm outline-none" placeholder="Tags (comma separated)" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-[#005FB8] hover:bg-[#006bd1] active:scale-[0.99]'}`}>
            {loading ? 'Processing via Groq Engine...' : 'Generate SEO Variants'}
          </button>
          {error && <p className="text-center text-red-500 font-bold text-sm bg-red-50 p-4 rounded-lg">{error}</p>}
        </form>

        {/* RESULTS SECTION */}
        <section className="space-y-6 pb-20">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">History Results</h2>
            <div className="flex items-center gap-4">
              {results.length > 0 && (
                <>
                  <select 
                    className="p-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2c2c] cursor-pointer"
                    value={filterIndex}
                    onChange={(e) => setFilterIndex(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  >
                    <option value="all">Show All Results</option>
                    {results.map((_, idx) => <option key={idx} value={idx}>Result #{results.length - idx}</option>)}
                  </select>
                  <button onClick={() => {if(confirm('Clear history?')){setResults([]); localStorage.removeItem('zazzle_v12.0');}}} className="text-xs text-red-500 hover:underline">Clear</button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {results.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-gray-50/50 dark:bg-[#2c2c2c]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">No results to display.</div>
            ) : (
              results.map((v, i) => {
                // Logic lọc theo Dropbox
                if (filterIndex !== 'all' && filterIndex !== i) return null;
                
                return (
                  <div key={i} className="p-8 rounded-2xl bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#005FB8]"></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xl font-black text-[#005FB8] dark:text-[#4facfe] bg-gray-50 dark:bg-[#242424] px-4 py-2 rounded-lg">#{results.length - i}</span>
                      {i === 0 && <span className="text-[10px] font-bold bg-[#005FB8] text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Latest</span>}
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Zazzle Title</label>
                          <CopyBtn text={v.newTitle} />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{v.newTitle}</p>
                      </div>

                      <div className="group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Description</label>
                          <CopyBtn text={v.newDescription} />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#242424] p-4 rounded-xl italic">"{v.newDescription}"</p>
                      </div>

                      <div className="group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">SEO Tags (Unique)</label>
                          <CopyBtn text={v.newTags} />
                        </div>
                        <p className="text-xs font-mono font-bold text-[#005FB8] dark:text-[#4facfe] tracking-wider break-words">{v.newTags}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}