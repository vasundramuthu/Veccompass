import React, { useState } from 'react';
import { Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { OrangePowerupImp } from './MonsterIcons';

export default function AnalogySolver({ activeModel, onSelectWordForPlot }) {
  const [wordA, setWordA] = useState('man');
  const [wordB, setWordB] = useState('king');
  const [wordC, setWordC] = useState('woman');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = [
    { a: 'man', b: 'king', c: 'woman', label: 'king - man + woman = queen 👑' },
    { a: 'france', b: 'paris', c: 'japan', label: 'paris - france + japan = tokyo 🗼' },
    { a: 'dog', b: 'puppy', c: 'cat', label: 'puppy - dog + cat = kitten 🐱' },
    { a: 'good', b: 'better', c: 'bad', label: 'better - good + bad = worse ⚡' }
  ];

  const handleSolve = async (a = wordA, b = wordB, c = wordC) => {
    if (!a.trim() || !b.trim() || !c.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.solveAnalogy(a.trim(), b.trim(), c.trim(), activeModel, 5);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to solve analogy.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setWordA(preset.a);
    setWordB(preset.b);
    setWordC(preset.c);
    handleSolve(preset.a, preset.b, preset.c);
  };

  return (
    <div className="card-squishy p-6 flex flex-col h-full">
      <div className="pb-4 border-b border-purple-500/30 mb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <OrangePowerupImp className="w-6 h-6" />
          Vector Analogy Magic Calculator
        </h3>
        <p className="text-xs text-purple-200 font-bold mt-0.5 font-mono">
          vector(B) - vector(A) + vector(C) = ?
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 text-xs bg-purple-900/80 hover:bg-purple-800 text-amber-300 font-bold rounded-xl border border-purple-500/40 font-mono transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Formula Input Fields */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-purple-950/80 p-3 rounded-2xl border-2 border-purple-500/30 text-center">
        <div>
          <span className="text-[10px] text-pink-300 font-black block mb-1">Word A (Base)</span>
          <input
            type="text"
            value={wordA}
            onChange={(e) => setWordA(e.target.value)}
            className="w-full bg-purple-900 border-2 border-purple-600 rounded-xl py-1.5 px-2 text-xs font-black font-mono text-center text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <span className="text-[10px] text-amber-300 font-black block mb-1">Word B (Target A)</span>
          <input
            type="text"
            value={wordB}
            onChange={(e) => setWordB(e.target.value)}
            className="w-full bg-purple-900 border-2 border-purple-600 rounded-xl py-1.5 px-2 text-xs font-black font-mono text-center text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <span className="text-[10px] text-emerald-300 font-black block mb-1">Word C (New Base)</span>
          <input
            type="text"
            value={wordC}
            onChange={(e) => setWordC(e.target.value)}
            className="w-full bg-purple-900 border-2 border-purple-600 rounded-xl py-1.5 px-2 text-xs font-black font-mono text-center text-white focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      <button
        onClick={() => handleSolve()}
        disabled={loading}
        className="w-full btn-candy-orange text-white text-xs font-black py-3 rounded-2xl transition-all shadow-lg mb-4"
      >
        {loading ? 'Brewing Math Magic...' : '✨ Compute Analogy Vector'}
      </button>

      {/* Error View */}
      {error && (
        <div className="p-3 bg-pink-500/10 border-2 border-pink-500/40 rounded-2xl text-xs text-pink-300 flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Output */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {results && results.results ? (
          results.results.map((res, idx) => (
            <div
              key={res.word}
              onClick={() => onSelectWordForPlot && onSelectWordForPlot(res.word)}
              className="p-3 bg-purple-950/80 hover:bg-purple-900/90 border-2 border-purple-500/30 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-purple-900 text-amber-300 border border-amber-500/40 text-xs font-mono font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-black text-sm text-white font-mono">
                    {res.word}
                  </span>
                  <span className="block text-[10px] text-purple-300 font-bold capitalize">
                    {res.freq_bucket} frequency
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-black text-emerald-400">
                  {res.similarity.toFixed(4)}
                </span>
                <span className="block text-[10px] text-purple-300 font-bold">similarity</span>
              </div>
            </div>
          ))
        ) : (
          !loading && !error && (
            <div className="text-center py-8 text-purple-300 font-bold text-xs">
              Select an analogy preset or enter words above!
            </div>
          )
        )}
      </div>
    </div>
  );
}
