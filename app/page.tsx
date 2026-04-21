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
      className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all duration-150 border ${ok ? 'bg-[#005FB8] border-[#005FB8] text-white' : 'bg-[#FBFBFB] border-gray-300 text-gray-700 hover:bg-[#F3F3F3]'}`}
    >
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function Ver10Tool() {
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
    const saved = localStorage.getItem('zazzle_v10.0');
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
    if (!textDesign) return setError('Please enter the Text Design Prefix.');
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
      localStorage.setItem('zazzle_v10.0', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const clearHistory = () => {
    if(confirm('Clear all history?')) { setResults([]); localStorage.removeItem('zazzle_v10.0'); }
  }

  return (
    <div className="w-full min-h-screen bg-[#F3F3F3] p-4 lg:p-8 text-[#111111] font-[Segoe_UI,system-ui,sans-serif] selection:bg-[#005FB8] selection:text-white">
      
      <header className="mb-8 pl-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#242424] mb-1">
          Zazzle SEO Architect
        </h1>
        <p className="text-sm font-normal text-[#616161]">
          Version 10.0 • Windows 11 Fluent Design • Groq LPU
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px]">
        
        {/* INPUT COLUMN */}
        <form onSubmit={submit} className="flex-1 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/70">
            <h2 className="text-base font-semibold mb-4 text-[#242424]">General Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[13px] font-medium text-[#424242] block mb-1.5">Text Design Prefix</label>
                <input type="text" className="w-full p-2.5 rounded-md bg-white border border-gray-300 text-[14px] text-[#242424] outline-none focus:border-[#005FB8] focus:ring-1 focus:ring-[#005FB8] transition-all shadow-sm" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Retro Cat Mama" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-[#424242] block mb-1.5">Variants to Generate</label>
                <select className="w-full p-2.5 rounded-md bg-white border border-gray-300 text-[14px] text-[#242424] outline-none focus:border-[#005FB8] focus:ring-1 focus:ring-[#005FB8] transition-all shadow-sm cursor-pointer" value={qty} onChange={e => setQty(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Options</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#424242] block mb-1.5">Insight Context</label>
              <textarea className="w-full h-24 p-2.5 rounded-md bg-white border border-gray-300 text-[14px] text-[#242424] outline-none focus:border-[#005FB8] focus:ring-1 focus:ring-[#005FB8] transition-all shadow-sm resize-none" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Paste cultural background or blog snippet..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AMAZON DATA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/70 flex flex-col max-h-[500px]">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-[#242424]">Amazon Data</h2>
                  <select className="text-[13px] p-1.5 rounded-md border border-gray-300 bg-white text-[#242424] outline-none cursor-pointer focus:border-[#005FB8]" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
               </div>
               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {amzItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 rounded-lg bg-[#FAFAFA] border border-gray-200">
                      <div className="text-[11px] font-semibold text-[#616161] uppercase tracking-wider">Product {i+1}</div>
                      <input className="w-full text-[13px] bg-white border border-gray-300 rounded-md p-2 outline-none focus:border-[#005FB8]" placeholder="Amazon Title" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                      <textarea className="w-full h-16 text-[13px] bg-white border border-gray-300 rounded-md p-2 outline-none resize-none focus:border-[#005FB8]" placeholder="Amazon Description" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                    </div>
                  ))}
               </div>
            </div>

            {/* ETSY DATA */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/70 flex flex-col max-h-[500px]">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-[#242424]">Etsy Data</h2>
                  <select className="text-[13px] p-1.5 rounded-md border border-gray-300 bg-white text-[#242424] outline-none cursor-pointer focus:border-[#005FB8]" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Items</option>)}
                  </select>
               </div>
               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {etsyItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 rounded-lg bg-[#FAFAFA] border border-gray-200">
                      <div className="text-[11px] font-semibold text-[#616161] uppercase tracking-wider">Product {i+1}</div>
                      <input className="w-full text-[13px] bg-white border border-gray-300 rounded-md p-2 outline-none focus:border-[#005FB8]" placeholder="Etsy Title" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                      <input className="w-full text-[13px] bg-white border border-gray-300 rounded-md p-2 outline-none focus:border-[#005FB8]" placeholder="Etsy Tags (comma separated)" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-md font-semibold text-[14px] text-white transition-all duration-150 shadow-sm ${loading ? 'bg-[#005FB8]/70 cursor-wait' : 'bg-[#005FB8] hover:bg-[#0053a0] active:scale-[0.99]'}`}>
            {loading ? 'Processing via Groq...' : 'Generate Listing'}
          </button>
          
          {error && <div className="p-3 rounded-md bg-[#FDE7E9] border border-[#F9C3C6] text-[#B3261E] text-[13px] font-medium">{error}</div>}
        </form>

        {/* OUTPUT COLUMN */}
        <div className="flex-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/70 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-[#242424]">Output History</h2>
               {results.length > 0 && <button onClick={clearHistory} className="text-[13px] font-medium text-[#005FB8] hover:underline">Clear all</button>}
            </div>
            
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {results.length === 0 && (
                <div className="h-full flex items-center justify-center text-[#757575] text-[14px]">
                  No records to display.
                </div>
              )}
              
              {results.map((v, i) => (
                <div key={i} className="p-5 rounded-lg bg-[#FAFAFA] border border-gray-200 relative group hover:border-gray-300 transition-colors">
                  {i === 0 && <div className="absolute top-4 right-4 bg-[#005FB8] text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">New</div>}
                  
                  <div className="space-y-5 mt-1">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[12px] font-semibold text-[#424242]">Title</span>
                        <CopyBtn text={v.newTitle} />
                      </div>
                      <p className="text-[15px] font-medium text-[#111111] pr-12 leading-relaxed">{v.newTitle}</p>
                    </div>

                    <div className="h-[1px] w-full bg-gray-200"></div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[12px] font-semibold text-[#424242]">Description</span>
                        <CopyBtn text={v.newDescription} />
                      </div>
                      <p className="text-[14px] text-[#424242] leading-relaxed">
                        {v.newDescription}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-gray-200"></div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[12px] font-semibold text-[#424242]">Tags (Unique)</span>
                        <CopyBtn text={v.newTags} />
                      </div>
                      <div className="p-3 bg-[#F3F3F3] border border-gray-200 rounded-md">
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