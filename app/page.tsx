'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); };
  return (
    <button onClick={copy} className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${ok ? 'bg-[#34c759] text-white' : 'bg-[#e5e5ea] text-[#1d1d1f] hover:bg-[#d1d1d6]'}`}>
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function Ver90Tool() {
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
    const saved = localStorage.getItem('zazzle_v9.0');
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
      localStorage.setItem('zazzle_v9.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const clearHistory = () => {
    if(confirm('Xóa toàn bộ lịch sử?')) { setResults([]); localStorage.removeItem('zazzle_v9.0'); }
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F7] p-6 lg:p-12 text-[#1D1D1F] font-sans selection:bg-[#0071E3] selection:text-white">
      
      <header className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-2">
          Zazzle Architect
        </h1>
        <p className="text-[12px] font-medium text-[#86868B] uppercase tracking-widest">
          Version 9.0 • Groq Engine
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8 max-w-[1400px] mx-auto">
        
        {/* INPUT COLUMN */}
        <form onSubmit={submit} className="flex-1 space-y-8">
          
          <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-[12px] font-medium text-[#86868B] block mb-2">Text Design Prefix</label>
                <input type="text" className="w-full p-3.5 rounded-xl bg-[#F5F5F7] text-[14px] outline-none focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 focus:border-[#0071E3] border border-transparent transition-all" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#86868B] block mb-2">Variants to Generate</label>
                <select className="w-full p-3.5 rounded-xl bg-[#F5F5F7] text-[14px] outline-none focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 border border-transparent transition-all cursor-pointer appearance-none" value={qty} onChange={e => setQty(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#86868B] block mb-2">Insight Context</label>
              <textarea className="w-full h-28 p-4 rounded-xl bg-[#F5F5F7] text-[14px] outline-none focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 border border-transparent transition-all resize-none" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Paste cultural background or blog snippet here..." />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Amazon Data</h2>
                <select className="text-[12px] p-2 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] outline-none cursor-pointer" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                </select>
             </div>
             <div className="space-y-4">
                {amzItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-[#E5E5EA] bg-[#FAFAFC]">
                    <div className="text-[10px] font-bold text-[#86868B] uppercase">Item {i+1}</div>
                    <input className="w-full text-[13px] bg-transparent outline-none placeholder-[#86868B]" placeholder="Title..." value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                    <div className="w-full h-[1px] bg-[#E5E5EA]"></div>
                    <textarea className="w-full h-12 text-[13px] bg-transparent outline-none resize-none placeholder-[#86868B]" placeholder="Description..." value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Etsy Data</h2>
                <select className="text-[12px] p-2 rounded-lg bg-[#F5F5F7] text-[#1D1D1F] outline-none cursor-pointer" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                </select>
             </div>
             <div className="space-y-4">
                {etsyItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-[#E5E5EA] bg-[#FAFAFC]">
                    <div className="text-[10px] font-bold text-[#86868B] uppercase">Item {i+1}</div>
                    <input className="w-full text-[13px] bg-transparent outline-none placeholder-[#86868B]" placeholder="Title..." value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                    <div className="w-full h-[1px] bg-[#E5E5EA]"></div>
                    <input className="w-full text-[13px] bg-transparent outline-none placeholder-[#86868B]" placeholder="Tags (comma separated)..." value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                  </div>
                ))}
             </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-medium text-[15px] text-white transition-all duration-200 ${loading ? 'bg-[#99C3F3] cursor-wait' : 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98]'}`}>
            {loading ? 'Processing...' : 'Generate Listing'}
          </button>
          
          {error && <div className="p-4 rounded-xl bg-[#FFF2F2] text-[#FF3B30] text-[13px] font-medium text-center">{error}</div>}
        </form>

        {/* OUTPUT COLUMN */}
        <div className="flex-1">
          <div className="sticky top-12">
            <div className="flex justify-between items-end mb-6">
               <h2 className="text-2xl font-semibold tracking-tight">Results</h2>
               {results.length > 0 && <button onClick={clearHistory} className="text-[13px] text-[#0071E3] hover:underline">Clear History</button>}
            </div>
            
            <div className="space-y-6 h-[85vh] overflow-y-auto pb-20 custom-scrollbar pr-2">
              {results.length === 0 && (
                <div className="h-40 flex items-center justify-center rounded-[24px] bg-[#E5E5EA]/30 text-[#86868B] text-[14px]">
                  No data generated yet.
                </div>
              )}
              
              {results.map((v, i) => (
                <div key={i} className="bg-white p-8 rounded-[24px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E5E5EA]/50 relative">
                  {i === 0 && <div className="absolute top-6 right-6 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#34C759]"></span><span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Latest</span></div>}
                  
                  <div className="space-y-6 mt-2">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Title</span>
                        <CopyBtn text={v.newTitle} />
                      </div>
                      <p className="text-[17px] font-medium text-[#1D1D1F] leading-snug pr-8">{v.newTitle}</p>
                    </div>

                    <div className="h-[1px] w-full bg-[#F5F5F7]"></div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Description</span>
                        <CopyBtn text={v.newDescription} />
                      </div>
                      <p className="text-[14px] text-[#1D1D1F] leading-relaxed">
                        {v.newDescription}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-[#F5F5F7]"></div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Tags</span>
                        <CopyBtn text={v.newTags} />
                      </div>
                      <p className="text-[13px] font-mono text-[#0071E3] tracking-wide leading-relaxed">
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