import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Play, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster, GreenBubbleMonster } from './MonsterIcons';

export default function SemanticWalk({ activeModel }) {
  const [wordStart, setWordStart] = useState('small');
  const [wordEnd, setWordEnd] = useState('biggest');
  const [steps, setSteps] = useState(8);
  const [walkData, setWalkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const presets = [
    { start: 'small', end: 'biggest', label: 'small → biggest 📈' },
    { start: 'bad', end: 'best', label: 'bad → best ⭐' },
    { start: 'king', end: 'queen', label: 'king → queen 👑' },
    { start: 'paris', end: 'tokyo', label: 'paris → tokyo 🗼' }
  ];

  useEffect(() => {
    fetchWalk(wordStart, wordEnd);
  }, [activeModel]);

  const fetchWalk = async (s = wordStart, e = wordEnd) => {
    if (!s.trim() || !e.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSemanticWalk(s.trim(), e.trim(), activeModel, steps);
      setWalkData(res);
      setActiveStepIdx(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to compute semantic walk.");
      setWalkData(null);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (p) => {
    setWordStart(p.start);
    setWordEnd(p.end);
    fetchWalk(p.start, p.end);
  };

  const trajectory = walkData?.trajectory || [];
  const currentStep = trajectory[activeStepIdx] || {};

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <GreenBubbleMonster className="w-6 h-6" />
            Semantic Walk &amp; Linear Interpolation 🚶‍♂️
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1 font-mono">
            v(t) = (1 - t) * v_start + t * v_end
          </p>
        </div>

        <button
          onClick={() => fetchWalk()}
          disabled={loading}
          className="btn-candy-pink text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg disabled:opacity-50"
        >
          {loading ? 'Walking...' : 'Compute Trajectory 🚀'}
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-purple-300 font-bold self-center">Presets:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 bg-purple-900/80 hover:bg-purple-800 text-amber-300 font-bold rounded-xl border border-purple-500/40 text-xs font-mono"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Start & End Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-950/80 p-4 rounded-3xl border-2 border-purple-500/30">
        <div>
          <label className="text-xs font-black text-pink-300 block mb-1">Start Word (t = 0.0)</label>
          <input
            type="text"
            value={wordStart}
            onChange={(e) => setWordStart(e.target.value)}
            className="w-full bg-purple-900 border-2 border-purple-600 rounded-xl p-2.5 text-xs font-black text-white font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-black text-emerald-300 block mb-1">End Word (t = 1.0)</label>
          <input
            type="text"
            value={wordEnd}
            onChange={(e) => setWordEnd(e.target.value)}
            className="w-full bg-purple-900 border-2 border-purple-600 rounded-xl p-2.5 text-xs font-black text-white font-mono"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-pink-500/10 border-2 border-pink-500/40 rounded-2xl text-xs text-pink-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Trajectory Interactive Slider & Steps Display */}
      {trajectory.length > 0 && (
        <div className="space-y-6">
          <div className="bg-purple-950/90 p-5 rounded-3xl border-2 border-purple-500/40 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-purple-300">Trajectory Step: {activeStepIdx + 1} / {trajectory.length}</span>
              <span className="text-amber-300">Interpolation factor t = {currentStep.t}</span>
            </div>

            <input
              type="range"
              min="0"
              max={trajectory.length - 1}
              step="1"
              value={activeStepIdx}
              onChange={(e) => setActiveStepIdx(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />

            <div className="p-4 bg-purple-900/80 rounded-2xl border-2 border-pink-500/50 flex items-center justify-between text-center">
              <div>
                <span className="text-[10px] text-purple-300 font-bold block">Start</span>
                <span className="text-sm font-black text-pink-300 font-mono">{wordStart}</span>
              </div>
              <div className="text-center px-4">
                <span className="text-xs font-black text-white block">Nearest Vector at t = {currentStep.t}</span>
                <span className="text-xl font-black text-amber-300 font-mono block scale-110 my-1 animate-pulse">
                  {currentStep.word}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">cos sim: {currentStep.similarity}</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300 font-bold block">End</span>
                <span className="text-sm font-black text-emerald-300 font-mono">{wordEnd}</span>
              </div>
            </div>
          </div>

          {/* All Trajectory Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {trajectory.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStepIdx(idx)}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  activeStepIdx === idx
                    ? 'bg-pink-600/30 border-pink-500 text-white scale-105 shadow-lg'
                    : 'bg-purple-950/70 border-purple-500/30 text-purple-200 hover:border-purple-400'
                }`}
              >
                <span className="text-[10px] text-purple-300 font-mono block font-bold">t = {step.t}</span>
                <span className="text-xs font-black text-amber-300 font-mono block truncate mt-1">
                  {step.word}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
