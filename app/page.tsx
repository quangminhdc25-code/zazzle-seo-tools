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
      className={`text-[12px] font-medium px-4 py-1.5 rounded-[8px] transition-all duration-200 shadow-sm border ${
        ok 
        ? 'bg-[#005FB8] border-[#005FB8] text-white shadow-[#005FB8]/20' 
        : 'bg-white/80 border-gray-200/60 text-gray-700 hover:bg-white hover:shadow-md'
      }`}
    >
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function Ver11Tool() {
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
    const saved = localStorage.getItem('zazzle_v11.0');
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
      localStorage.setItem('zazzle_v11.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const clearHistory = () => {
    if(confirm('Bạn có chắc chắn muốn xóa lịch sử?')) { setResults([]); localStorage.removeItem('zazzle_v11.0'); }
  }

  return (
    <div className="w-full min-h-screen font-[Segoe_UI,system-ui,sans-serif] text-gray-900 bg-gradient-to-br from-[#e4ecfa] via-[#f4f5f7] to-[#eaf2fb] p-6 lg:p-8 selection:bg-[#005FB8]/20 selection:text-[#005FB8]">
      
      {/* HEADER */}
      <header className="mb-8 px-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-1">
          Zazzle SEO Architect
        </h1>
        <p className="text-[13px] font-medium text-gray-500">
          Version 11.0 • Windows 11 Fluent Mica
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px]">
        
        {/* INPUT COLUMN */}
        <form onSubmit={submit} className="flex-1 space-y-6">
          
          {/* GENERAL INFO (GLASS PANEL) */}
          <div className="p-6 rounded-[12px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all">
            <h2 className="text-[16px] font-semibold mb-5 text-gray-800">General Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label className="text-[13px] font-medium text-gray-600 block mb-2">Text Design Prefix</label>
                <input type="text" className="w-full p-2.5 rounded-[8px] bg-white/80 border border-gray-200/60 text-[14px] text-gray-800 outline-none focus:bg-white focus:border-[#005FB8] focus:ring-2 focus:ring-[#005FB8]/20 transition-all shadow-sm hover:bg-white" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-600 block mb-2">Variants Output</label>
                <select className="w-full p-2.5 rounded-[8px] bg-white/80 border border-gray-200/60 text-[14px] text-gray-800 outline-none focus:bg-white focus:border-[#005FB8] focus:ring-2 focus:ring-[#005FB8]/20 transition-all shadow-sm cursor-pointer hover:bg-white" value={qty} onChange={e => setQty(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Options</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-600 block mb-2">Insight Context</label>
              <textarea className="w-full h-24 p-3 rounded-[8px] bg-white/80 border border-gray-200/60 text-[14px] text-gray-800 outline-none focus:bg-white focus:border-[#005FB8] focus:ring-2 focus:ring-[#005FB8]/20 transition-all shadow-sm resize-none hover:bg-white" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Paste cultural background or storytelling context..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AMAZON DATA (GLASS PANEL) */}
            <div className="p-6 rounded-[12px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col max-h-[520px]">
               <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[16px] font-semibold text-gray-800">Amazon Data</h2>
                  <select className="text-[13px] py-1.5 px-3 rounded-[8px] border border-gray-200/60 bg-white/80 hover:bg-white text-gray-800 outline-none cursor-pointer focus:border-[#005FB8] transition-all shadow-sm" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
               </div>
               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {amzItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-[8px] bg-white/50 border border-white shadow-sm transition-all hover:bg-white/80 hover:shadow-md">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Product {i+1}</div>
                      <input className="w-full text-[13px] bg-transparent border-b border-gray-200 pb-2 outline-none focus:border-[#005FB8] transition-colors placeholder-gray-400" placeholder="Title" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                      <textarea className="w-full h-16 text-[13px] bg-transparent outline-none resize-none focus:border-[#005FB8] transition-colors placeholder-gray-400" placeholder="Description" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                    </div>
                  ))}
               </div>
            </div>

            {/* ETSY DATA (GLASS PANEL) */}
            <div className="p-6 rounded-[12px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col max-h-[520px]">
               <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[16px] font-semibold text-gray-800">Etsy Data</h2>
                  <select className="text-[13px] py-1.5 px-3 rounded-[8px] border border-gray-200/60 bg-white/80 hover:bg-white text-gray-800 outline-none cursor-pointer focus:border-[#005FB8] transition-all shadow-sm" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
               </div>
               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {etsyItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-3 p-4 rounded-[8px] bg-white/50 border border-white shadow-sm transition-all hover:bg-white/80 hover:shadow-md">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Product {i+1}</div>
                      <input className="w-full text-[13px] bg-transparent border-b border-gray-200 pb-2 outline-none focus:border-[#005FB8] transition-colors placeholder-gray-400" placeholder="Title" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                      <input className="w-full text-[13px] bg-transparent outline-none focus:border-[#005FB8] transition-colors placeholder-gray-400" placeholder="Tags (comma separated)" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-[8px] font-semibold text-[14px] text-white transition-all duration-200 shadow-md ${loading ? 'bg-[#005FB8]/70 cursor-wait' : 'bg-[#005FB8] hover:bg-[#1975C5] active:scale-[0.98]'}`}>
            {loading ? 'Processing through Groq...' : 'Generate Listing'}
          </button>
          
          {error && <div className="p-3 rounded-[8px] bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 text-[13px] font-medium shadow-sm">{error}</div>}
        </form>

        {/* OUTPUT COLUMN */}
        <div className="flex-1">
          <div className="p-6 rounded-[12px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/60">
               <h2 className="text-[18px] font-semibold text-gray-800">Output History</h2>
               {results.length > 0 && <button onClick={clearHistory} className="text-[13px] font-medium text-[#005FB8] hover:underline transition-all">Clear All</button>}
            </div>
            
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {results.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-[14px] font-medium">
                  No listings generated yet.
                </div>
              )}
              
              {results.map((v, i) => (
                <div key={i} className="p-6 rounded-[12px] bg-white/70 border border-white shadow-sm relative group hover:shadow-md transition-all duration-200">
                  {i === 0 && <div className="absolute top-5 right-5 bg-[#005FB8] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-[4px] shadow-sm">NEW</div>}
                  
                  <div className="space-y-5 mt-1">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Title</span>
                        <CopyBtn text={v.newTitle} />
                      </div>
                      <p className="text-[16px] font-semibold text-gray-900 pr-14 leading-snug">{v.newTitle}</p>
                    </div>

                    <div className="h-[1px] w-full bg-gray-200/60"></div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Description</span>
                        <CopyBtn text={v.newDescription} />
                      </div>
                      <p className="text-[14px] text-gray-700 leading-relaxed bg-white/50 p-4 rounded-[8px] border border-gray-100">
                        {v.newDescription}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-gray-200/60"></div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Tags (10 Unique)</span>
                        <CopyBtn text={v.newTags} />
                      </div>
                      <div className="p-4 bg-white/50 border border-gray-100 rounded-[8px]">
                        <p className="text-[13px] font-mono text-[#005FB8] leading-relaxed break-words">
                          {v.newTags}
                        </p>
                      </div>
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