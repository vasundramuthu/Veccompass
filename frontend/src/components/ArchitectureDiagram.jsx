import React, { useState } from 'react';
import { Sparkles, Flame, Gem, Wand2, Star, Trophy } from 'lucide-react';
import { PinkChibiMonster, GreenBubbleMonster, OrangePowerupImp, PurpleCauldronImp } from './MonsterIcons';

export default function ArchitectureDiagram() {
  const [selectedArch, setSelectedArch] = useState('cbow');
  const sampleSentence = ['the', 'king', 'sits', 'on', 'the', 'royal', 'throne'];
  const [targetIdx, setTargetIdx] = useState(3); // 'on'
  const windowSize = 2;

  const contextIndices = sampleSentence
    .map((_, i) => i)
    .filter((i) => i !== targetIdx && Math.abs(i - targetIdx) <= windowSize);

  return (
    <div className="card-squishy p-6 relative overflow-hidden">
      {/* Decorative Floating Game Stars */}
      <Star className="w-6 h-6 text-amber-300 absolute top-4 right-8 animate-wiggle opacity-80" />
      <Sparkles className="w-5 h-5 text-pink-400 absolute top-12 left-6 animate-pulse opacity-80" />

      {/* Header & Architecture Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-purple-500/30 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <OrangePowerupImp className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-emerald-300 font-sans">
                VecCompass Monster Lab 👾
              </h2>
              <p className="text-xs text-purple-200 font-semibold mt-0.5">
                Gamified Word2Vec Simulator: Stomp tiles &amp; brew magical vectors!
              </p>
            </div>
          </div>
        </div>

        {/* 3D Game Toggle Buttons */}
        <div className="flex bg-purple-950/90 p-1.5 rounded-2xl border-2 border-purple-500/40 shadow-inner self-start md:self-auto">
          <button
            onClick={() => setSelectedArch('cbow')}
            className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${
              selectedArch === 'cbow'
                ? 'btn-candy-pink text-white scale-105'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            🍡 CBOW Cauldron
          </button>
          <button
            onClick={() => setSelectedArch('skipgram')}
            className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all ${
              selectedArch === 'skipgram'
                ? 'btn-candy-purple text-white scale-105'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            🚀 Skip-gram Rocket
          </button>
        </div>
      </div>

      {/* Bouncy Context Window Simulator */}
      <div className="mt-6 bg-purple-950/60 p-6 rounded-3xl border-2 border-pink-500/30 shadow-xl relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            Stomp a Word Tile to Change Target Power-Up!
          </span>
          <span className="text-xs font-bold text-pink-300 bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/40">
            Window Radius: ±{windowSize}
          </span>
        </div>

        {/* Monster Tile Track */}
        <div className="flex flex-wrap gap-3 items-center justify-center py-6 bg-purple-900/50 rounded-2xl border-2 border-purple-500/20">
          {sampleSentence.map((word, idx) => {
            const isTarget = idx === targetIdx;
            const isContext = contextIndices.includes(idx);
            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Cute Chibi Monster Icon above Tile */}
                <div className="mb-1 h-8 flex items-center justify-center">
                  {isTarget ? (
                    <OrangePowerupImp className="w-9 h-9" />
                  ) : isContext ? (
                    idx % 2 === 0 ? <PinkChibiMonster className="w-7 h-7" /> : <GreenBubbleMonster className="w-7 h-7" />
                  ) : (
                    <PurpleCauldronImp className="w-6 h-6 opacity-40" />
                  )}
                </div>

                {/* Stompable 3D Button Tile */}
                <button
                  onClick={() => setTargetIdx(idx)}
                  className={`tile-squash px-5 py-3 text-sm font-black rounded-2xl font-mono tracking-wide ${
                    isTarget
                      ? 'btn-candy-orange text-white text-base ring-4 ring-amber-300/80 animate-powerup scale-110 shadow-2xl'
                      : isContext
                      ? 'btn-candy-pink text-white shadow-md'
                      : 'bg-purple-950/80 text-purple-300 border-2 border-purple-700/50 hover:bg-purple-900/60'
                  }`}
                >
                  {word}
                  {isTarget && (
                    <span className="block text-[10px] text-amber-200 font-extrabold uppercase tracking-widest mt-0.5">
                      🔥 Target Power-Up
                    </span>
                  )}
                  {isContext && (
                    <span className="block text-[10px] text-pink-200 font-extrabold uppercase tracking-widest mt-0.5">
                      🍬 Context Helper
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three Magical Play Zones */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone 1: Input Zone (Chibi Monster Crew) */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-pink-500/40 relative">
          <div className="flex items-center space-x-2 text-pink-300 font-black text-sm mb-4">
            <span className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-black shadow-md">
              1
            </span>
            <span>Input Zone: {selectedArch === 'cbow' ? 'Context Helpers' : 'Target Power-Up'}</span>
          </div>

          <div className="space-y-3">
            {selectedArch === 'cbow' ? (
              contextIndices.map((i) => (
                <div key={i} className="p-3 bg-pink-950/60 border-2 border-pink-500/40 rounded-2xl text-xs font-mono font-bold text-pink-200 flex justify-between items-center shadow-md">
                  <div className="flex items-center space-x-2">
                    <PinkChibiMonster className="w-6 h-6" />
                    <span className="text-sm">{sampleSentence[i]}</span>
                  </div>
                  <span className="text-[11px] bg-pink-500/30 px-2 py-0.5 rounded-md text-pink-300">v_in[{sampleSentence[i]}]</span>
                </div>
              ))
            ) : (
              <div className="p-4 bg-amber-950/60 border-2 border-amber-500/50 rounded-2xl text-xs font-mono font-bold text-amber-200 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-2">
                  <OrangePowerupImp className="w-8 h-8" />
                  <span className="text-base text-amber-300">{sampleSentence[targetIdx]}</span>
                </div>
                <span className="text-[11px] bg-amber-500/30 px-2 py-0.5 rounded-md text-amber-300">v_target</span>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Projection Layer (Bubbling Cauldron) */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-500/40 flex flex-col justify-between relative overflow-hidden">
          {/* Animated Liquid Bubbles */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-4 h-4 rounded-full bg-emerald-400 absolute bottom-4 left-1/4 animate-bubble" />
            <div className="w-6 h-6 rounded-full bg-purple-400 absolute bottom-2 left-1/2 animate-bubble" style={{ animationDelay: '0.6s' }} />
            <div className="w-5 h-5 rounded-full bg-pink-400 absolute bottom-6 right-1/4 animate-bubble" style={{ animationDelay: '1.2s' }} />
          </div>

          <div>
            <div className="flex items-center space-x-2 text-purple-300 font-black text-sm mb-4">
              <span className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black shadow-md">
                2
              </span>
              <span>Projection Zone: Bubbling Vector Cauldron 🧪</span>
            </div>

            <div className="p-4 bg-purple-900/60 rounded-2xl border-2 border-purple-500/30 text-xs text-purple-200 leading-relaxed font-medium">
              {selectedArch === 'cbow' ? (
                <span>
                  <strong className="text-pink-300">Context Mean Pooling:</strong> Blends input context vectors into a smooth, liquid vector brew in 50D space.
                </span>
              ) : (
                <span>
                  <strong className="text-purple-300">Target Lookup:</strong> Direct lookup of the center word vector to independently predict context positions!
                </span>
              )}
            </div>
          </div>

          <div className="my-4 p-3 bg-purple-950 rounded-2xl border border-purple-700/50 text-center font-mono text-xs text-emerald-300 font-bold">
            {selectedArch === 'cbow' ? (
              <span>v_c = sum(v_i) / (2 * k)</span>
            ) : (
              <span>Loss = -log sigmoid(v_c * v_w)</span>
            )}
          </div>
        </div>

        {/* Zone 3: Output Zone (Unlocked Treasure Chest) */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-emerald-500/40 relative">
          <div className="flex items-center space-x-2 text-emerald-300 font-black text-sm mb-4">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md">
              3
            </span>
            <span>Output Zone: Unlocked Treasure Chest 🎁</span>
          </div>

          <div className="space-y-3">
            {selectedArch === 'cbow' ? (
              <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl text-xs font-mono font-bold text-emerald-200 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-7 h-7 text-amber-300 animate-bounce" />
                  <span className="text-base text-emerald-300">{sampleSentence[targetIdx]}</span>
                </div>
                <span className="px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-black uppercase">
                  ✨ Unlocked Target
                </span>
              </div>
            ) : (
              contextIndices.map((i) => (
                <div key={i} className="p-3 bg-purple-900/60 border-2 border-purple-500/40 rounded-2xl text-xs font-mono font-bold text-purple-200 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <GreenBubbleMonster className="w-6 h-6" />
                    <span className="text-sm">{sampleSentence[i]}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-black">Predicted Context</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
