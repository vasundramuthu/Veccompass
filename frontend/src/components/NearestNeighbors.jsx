import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertCircle, Trophy } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster, GreenBubbleMonster } from './MonsterIcons';

export default function NearestNeighbors({ activeModel, onSelectWordForPlot, selectedWordFromPlot }) {
  const [query, setQuery] = useState('king');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = ['king', 'france', 'dog', 'good', 'computer', 'apple', 'paris', 'skipgram'];

  useEffect(() => {
    if (selectedWordFromPlot) {
      setQuery(selectedWordFromPlot);
      fetchNeighbors(selectedWordFromPlot);
    }
  }, [selectedWordFromPlot]);

  useEffect(() => {
    fetchNeighbors(query);
  }, [activeModel]);

  const fetchNeighbors = async (wordToSearch) => {
    if (!wordToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getNearestNeighbors(wordToSearch.trim(), activeModel, 10);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || `Word '${wordToSearch}' not found in vocabulary.`);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchNeighbors(query);
  };

  const getBucketBadge = (bucket) => {
    switch (bucket) {
      case 'frequent':
        return <span className="px-2.5 py-0.5 text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-full">Frequent 👑</span>;
      case 'rare':
        return <span className="px-2.5 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">Rare 💎</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">Medium 🌿</span>;
    }
  };

  return (
    <div className="card-squishy p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-purple-500/30 mb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <PinkChibiMonster className="w-6 h-6" />
            Cosine Similarity Monster Explorer
          </h3>
          <p className="text-xs text-purple-200 font-semibold mt-0.5">Find nearest word vector matches</p>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stomp a word (e.g., king, france)..."
          className="w-full bg-purple-950/80 text-white text-sm font-bold pl-10 pr-28 py-3.5 rounded-2xl border-2 border-pink-500/40 focus:outline-none focus:border-pink-500 transition-colors font-mono"
        />
        <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-4" />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 btn-candy-pink text-white text-xs font-black px-4 py-2 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Explore 🚀'}
        </button>
      </form>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[11px] text-purple-300 font-bold self-center mr-1">Presets:</span>
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              fetchNeighbors(p);
            }}
            className="px-3 py-1 text-xs bg-purple-900/80 hover:bg-pink-600/30 text-purple-100 rounded-xl border border-purple-500/40 font-mono font-bold transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 bg-pink-500/10 border-2 border-pink-500/40 rounded-2xl text-xs text-pink-300 flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {results && results.neighbors && (
          <div className="mb-3 p-3 bg-purple-950/90 rounded-2xl border border-purple-500/30 text-xs flex justify-between items-center">
            <div>
              <span className="text-purple-300 font-bold">Target Word:</span>{' '}
              <span className="font-black text-amber-300 font-mono text-base ml-1">{results.target_word}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-300 font-bold">Count: {results.target_count}</span>
              {getBucketBadge(results.target_freq_bucket)}
            </div>
          </div>
        )}

        {results && results.neighbors ? (
          results.neighbors.map((item, index) => (
            <div
              key={item.word}
              onClick={() => onSelectWordForPlot && onSelectWordForPlot(item.word)}
              className="group p-3.5 bg-purple-950/70 hover:bg-purple-900/90 border-2 border-purple-500/30 hover:border-pink-500/60 rounded-2xl transition-all cursor-pointer flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-purple-900 text-pink-300 text-xs font-black font-mono flex items-center justify-center border border-pink-500/30">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-white group-hover:text-pink-300 font-mono">
                      {item.word}
                    </span>
                    {getBucketBadge(item.freq_bucket)}
                  </div>
                  {/* Progress Bar for Cosine Similarity */}
                  <div className="w-36 bg-purple-900 rounded-full h-2 mt-2 overflow-hidden border border-purple-700">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, Math.min(100, item.similarity * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-black text-amber-300">
                  {item.similarity.toFixed(4)}
                </span>
                <span className="block text-[10px] text-purple-300 font-bold">cos score</span>
              </div>
            </div>
          ))
        ) : (
          !loading && !error && (
            <div className="text-center py-12 text-purple-300 font-bold text-xs">
              Stomp a word above to search nearest monster vectors!
            </div>
          )
        )}
      </div>
    </div>
  );
}
