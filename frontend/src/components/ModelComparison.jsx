import React, { useState, useEffect } from 'react';
import { Layers, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster, GreenBubbleMonster } from './MonsterIcons';

export default function ModelComparison() {
  const [queryWord, setQueryWord] = useState('king');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = ['king', 'france', 'dog', 'computer', 'good', 'apple'];

  useEffect(() => {
    fetchComparison(queryWord);
  }, []);

  const fetchComparison = async (word) => {
    if (!word.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.compareArchitectures(word.trim());
      setComparison(data);
    } catch (err) {
      setError(err.response?.data?.detail || `Word '${word}' not found in vocabulary.`);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComparison(queryWord);
  };

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-pink-400" />
            CBOW vs. Skip-gram Monster Battle Arena ⚔️
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1">
            Compare nearest neighbor predictions side-by-side across architectures
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={queryWord}
          onChange={(e) => setQueryWord(e.target.value)}
          placeholder="Compare a word (e.g. king, france)..."
          className="flex-1 bg-purple-950/80 text-white text-sm font-bold px-4 py-3 rounded-2xl border-2 border-purple-500/40 focus:outline-none focus:border-pink-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-candy-pink text-white text-xs font-black px-6 py-3 rounded-2xl disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare ⚔️'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-purple-300 font-bold self-center">Presets:</span>
        {presets.map(p => (
          <button
            key={p}
            onClick={() => {
              setQueryWord(p);
              fetchComparison(p);
            }}
            className="px-3 py-1 bg-purple-900 text-purple-100 text-xs font-mono font-bold rounded-xl border border-purple-500/40 hover:border-pink-500"
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-pink-500/10 border-2 border-pink-500/40 rounded-2xl text-xs text-pink-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-400" />
          <span>{error}</span>
        </div>
      )}

      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CBOW Side */}
          <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-pink-500/40 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
              <span className="font-black text-sm text-pink-300 flex items-center gap-2">
                <PinkChibiMonster className="w-6 h-6" />
                Continuous Bag of Words (CBOW)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 bg-pink-500/30 text-pink-200 rounded-full font-black">Predict Target</span>
            </div>

            <div className="space-y-2">
              {comparison.cbow.neighbors.map((n, i) => (
                <div key={n.word} className="p-3 bg-purple-900/60 rounded-2xl border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-lg bg-purple-950 text-pink-300 font-mono font-black flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-black font-mono text-white">{n.word}</span>
                  </div>
                  <span className="font-mono text-pink-300 font-black">{n.similarity.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skipgram Side */}
          <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
              <span className="font-black text-sm text-purple-300 flex items-center gap-2">
                <GreenBubbleMonster className="w-6 h-6" />
                Skip-gram Rocket
              </span>
              <span className="text-[10px] px-2.5 py-0.5 bg-purple-500/30 text-purple-200 rounded-full font-black">Predict Context</span>
            </div>

            <div className="space-y-2">
              {comparison.skipgram.neighbors.map((n, i) => (
                <div key={n.word} className="p-3 bg-purple-900/60 rounded-2xl border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-lg bg-purple-950 text-emerald-300 font-mono font-black flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-black font-mono text-white">{n.word}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-black">{n.similarity.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
