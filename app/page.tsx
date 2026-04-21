'use client';

import React, { useState, useEffect } from 'react';

interface ZazzleVariant { newTitle: string; newDescription: string; newTags: string; }
interface AmazonItem { title: string; description: string; }
interface EtsyItem { title: string; tags: string; }

const CopyBtn = ({ text }: { text: string }) => {
  const [ok, setOk] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); };
  return (
    <button onClick={copy} className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border'}`}>
      {ok ? '✓ COPIED' : 'COPY'}
    </button>
  );
};

export default function Ver52Tool() {
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
    const saved = localStorage.getItem('zazzle_v5.2');
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
    if (!textDesign) return setError('Nhập Text Design!');
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
      localStorage.setItem('zazzle_v5.2', JSON.stringify(newResults));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 lg:p-12 text-slate-900">
      <h1 className="text-4xl font-black mb-2 text-center">ZAZZLE SEO <span className="text-indigo-600">VER 5.2</span></h1>
      <p className="text-center text-xs font-bold text-slate-400 mb-12 tracking-widest uppercase">OpenRouter Fallback Engine • Full-Screen</p>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* INPUT COLUMN */}
        <form onSubmit={submit} className="flex-1 space-y-8 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
          <div className="grid grid-cols-2 gap-6 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <div>
              <label className="text-[10px] font-black text-indigo-900 uppercase block mb-2">Text Design (Bắt buộc)</label>
              <input type="text" className="w-full p-4 rounded-xl border-none shadow-inner text-sm font-bold" value={textDesign} onChange={e => setTextDesign(e.target.value)} placeholder="e.g. Vintage Cat Mama" />
            </div>
            <div>
              <label className="text-[10px] font-black text-indigo-900 uppercase block mb-2">Số lượng đầu ra</label>
              <select className="w-full p-4 rounded-xl border-none shadow-inner text-sm font-bold bg-white" value={qty} onChange={e => setQty(Number(e.target.value))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Biến thể</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Insight Context (Bài viết/Blog)</label>
            <textarea className="w-full h-32 p-4 rounded-2xl bg-slate-50 border shadow-inner text-sm" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Dán bài viết vào đây..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-orange-800 uppercase">Amazon Data</label>
                <select className="text-[10px] p-1 border rounded bg-white font-bold" value={amzCount} onChange={e => handleAmzCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {amzItems.map((item, i) => (
                  <div key={i} className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-orange-200">
                    <input className="w-full p-2 text-xs border-b outline-none" placeholder="Title" value={item.title} onChange={e => { const n = [...amzItems]; n[i].title = e.target.value; setAmzItems(n); }} />
                    <textarea className="w-full h-16 p-2 text-xs outline-none" placeholder="Description" value={item.description} onChange={e => { const n = [...amzItems]; n[i].description = e.target.value; setAmzItems(n); }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-amber-800 uppercase">Etsy Data</label>
                <select className="text-[10px] p-1 border rounded bg-white font-bold" value={etsyCount} onChange={e => handleEtsyCount(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Sản phẩm</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {etsyItems.map((item, i) => (
                  <div key={i} className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-amber-200">
                    <input className="w-full p-2 text-xs border-b outline-none" placeholder="Title" value={item.title} onChange={e => { const n = [...etsyItems]; n[i].title = e.target.value; setEtsyItems(n); }} />
                    <input className="w-full p-2 text-xs outline-none" placeholder="Tags (dấu phẩy)" value={item.tags} onChange={e => { const n = [...etsyItems]; n[i].tags = e.target.value; setEtsyItems(n); }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white tracking-[0.2em] shadow-xl ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-black active:scale-95 transition-all'}`}>
            {loading ? 'ĐANG PHÂN TÍCH (FALLBACK ACTIVE)...' : 'GENERATE SEO CONTENT'}
          </button>
          {error && <p className="text-center text-red-500 font-bold text-xs bg-red-50 p-3 rounded-lg">{error}</p>}
        </form>

        {/* OUTPUT COLUMN */}
        <div className="flex-1 space-y-8 h-[90vh] overflow-y-auto pr-4">
          {results.length === 0 && <div className="h-full flex items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black text-2xl uppercase italic">No History Yet</div>}
          {results.map((v, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative">
              {i === 0 && <span className="absolute top-0 right-8 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-b-xl">LATEST</span>}
              <div className="space-y-6">
                <div className="flex justify-between gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="flex-1"><span className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Title</span><p className="text-lg font-black text-slate-900">{v.newTitle}</p></div>
                  <CopyBtn text={v.newTitle} />
                </div>
                <div className="flex justify-between gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="flex-1"><span className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Description</span><p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{v.newDescription}"</p></div>
                  <CopyBtn text={v.newDescription} />
                </div>
                <div className="flex justify-between gap-4 p-5 bg-slate-900 rounded-2xl shadow-inner">
                  <div className="flex-1"><span className="text-[10px] font-black text-indigo-400 uppercase mb-1 block">SEO Tags (Unique)</span><p className="text-xs font-mono font-bold text-white tracking-wider">{v.newTags}</p></div>
                  <CopyBtn text={v.newTags} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}