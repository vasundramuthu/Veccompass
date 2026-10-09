import React from 'react';
import { Compass, Cpu, Layers, BarChart2, BookOpen, Sliders, Trophy, Footprints } from 'lucide-react';
import { PinkChibiMonster } from './MonsterIcons';

export default function Navbar({
  activeTab,
  setActiveTab,
  models,
  activeModel,
  onSelectModel,
  corpusInfo,
  isTraining
}) {
  const tabs = [
    { id: 'explore', label: '🎮 2D/3D Monster Space', icon: Compass },
    { id: 'walk', label: '🚶 Semantic Walk', icon: Footprints },
    { id: 'compare', label: '⚔️ CBOW vs Skipgram', icon: Layers },
    { id: 'frequency', label: '📊 Frequency & Benchmarks', icon: BarChart2 },
    { id: 'quest', label: '🏆 Analogy Quest', icon: Trophy },
    { id: 'training', label: '🧪 Training Cauldron', icon: Sliders },
    { id: 'corpus', label: '📖 Corpus & Vector I/O', icon: BookOpen },
  ];

  return (
    <header className="bg-purple-950/95 border-b-4 border-purple-800/80 sticky top-0 z-40 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-pink-500 to-amber-400 rounded-2xl shadow-lg border-2 border-white/30 transform hover:scale-105 transition-transform">
              <PinkChibiMonster className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-emerald-300 font-sans">
                  VecCompass
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-pink-500 text-white rounded-full uppercase tracking-widest border border-white/40 shadow-sm">
                  Ultimate Edition 👾
                </span>
              </div>
              <p className="text-xs text-purple-200 font-bold hidden sm:block">
                Interactive Machine Learning Candy Playground &amp; Benchmark Suite
              </p>
            </div>
          </div>

          {/* Model Selector & Status Badges */}
          <div className="flex items-center space-x-4">
            {corpusInfo && (
              <div className="hidden md:flex items-center space-x-3 text-xs text-purple-200 bg-purple-900/80 px-4 py-2 rounded-2xl border-2 border-purple-500/30 font-bold shadow-inner">
                <div>
                  <span className="text-purple-400">Tokens:</span>{' '}
                  <span className="font-black text-white font-mono">{corpusInfo.total_tokens}</span>
                </div>
                <div className="h-4 w-0.5 bg-purple-600" />
                <div>
                  <span className="text-purple-400">Vocab:</span>{' '}
                  <span className="font-black text-amber-300 font-mono">{corpusInfo.vocab_size}</span>
                </div>
              </div>
            )}

            {/* Active Model Selector */}
            <div className="flex items-center space-x-2 bg-purple-900/90 p-1.5 rounded-2xl border-2 border-purple-500/40 shadow-md">
              <Cpu className="w-4 h-4 text-pink-400 ml-2" />
              <select
                value={activeModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2 py-1"
              >
                {models.map((m) => (
                  <option key={m.name} value={m.name} className="bg-purple-950 text-purple-100 font-bold">
                    {m.display_name} ({m.embedding_dim}D)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-t-2 border-purple-900/60 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-black rounded-2xl transition-all whitespace-nowrap shadow-sm ${
                  isActive
                    ? 'btn-candy-pink text-white scale-105 shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-purple-900/50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
