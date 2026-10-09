import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldAlert, Award, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster, GreenBubbleMonster } from './MonsterIcons';

export default function FrequencyComparison({ activeModel }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFrequencyData();
  }, [activeModel]);

  const fetchFrequencyData = async () => {
    setLoading(true);
    try {
      const res = await api.getFrequencyComparison(activeModel);
      setData(res.buckets);
    } catch (err) {
      console.error("Failed to load frequency comparison metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="card-squishy p-8 text-center text-purple-200 font-bold text-sm">
        Brewing frequency stability metrics... 🧪
      </div>
    );
  }

  const buckets = [
    { key: 'frequent', title: 'Frequent Words 👑', color: 'border-pink-500/50 bg-pink-950/40 text-pink-200', icon: Award, label: 'Well-trained & Highly Stable' },
    { key: 'medium', title: 'Medium Frequency 🌿', color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200', icon: TrendingUp, label: 'Moderate Vector Representation' },
    { key: 'rare', title: 'Rare Words 💎', color: 'border-purple-500/50 bg-purple-950/40 text-purple-200', icon: AlertTriangle, label: 'Sparse & Noisier Vectors' }
  ];

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PinkChibiMonster className="w-6 h-6" />
            Frequent vs. Rare Word Representation Lab
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1">
            Empirical evaluation of vector space stability, norms, and gradient updates
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buckets.map((b) => {
          const m = data[b.key] || {};
          const Icon = b.icon;
          return (
            <div key={b.key} className={`border-2 rounded-3xl p-5 ${b.color} flex flex-col justify-between space-y-4 shadow-xl`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-base text-white">{b.title}</span>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold opacity-80 block mb-4">{b.label}</span>

                <div className="space-y-3 font-mono text-xs font-bold">
                  <div className="flex justify-between p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30">
                    <span className="text-purple-300">Vocab Size:</span>
                    <span className="text-white">{m.word_count} words</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30">
                    <span className="text-purple-300">Avg Top-1 Sim:</span>
                    <span className="text-emerald-400 font-black">{m.avg_top1_similarity}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30">
                    <span className="text-purple-300">Avg Top-5 Sim:</span>
                    <span className="text-pink-300 font-black">{m.avg_top5_similarity}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30">
                    <span className="text-purple-300">Mean Norm:</span>
                    <span className="text-amber-300 font-black">{m.vector_norm_mean}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-purple-300 font-bold block mb-1">Sample Tokens:</span>
                <div className="flex flex-wrap gap-1">
                  {m.sample_words && m.sample_words.map(w => (
                    <span key={w} className="px-2.5 py-1 text-[10px] bg-purple-900 rounded-lg border border-purple-500/40 text-purple-100 font-mono font-bold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory Rationale */}
      <div className="p-5 bg-purple-950/80 rounded-3xl border-2 border-purple-500/40 space-y-3">
        <h4 className="text-sm font-black text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-pink-400" />
          Key Takeaways &amp; Machine Learning Rationale
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-purple-200 font-medium leading-relaxed">
          <div className="p-4 bg-purple-900/60 rounded-2xl border border-purple-500/30">
            <strong className="text-pink-300 font-black block mb-1">1. Frequent Words (Smooth &amp; Stable)</strong>
            Frequent words appear repeatedly across many sliding window contexts. Gradient updates continuously pull them into tight, stable semantic clusters.
          </div>

          <div className="p-4 bg-purple-900/60 rounded-2xl border border-purple-500/30">
            <strong className="text-amber-300 font-black block mb-1">2. Rare Words (Sparse &amp; Noisier)</strong>
            Rare words receive sparse gradient updates. In Skip-gram, individual context updates give rare words stronger pushes, making Skip-gram empirically superior for low-frequency vocabulary.
          </div>
        </div>
      </div>
    </div>
  );
}
