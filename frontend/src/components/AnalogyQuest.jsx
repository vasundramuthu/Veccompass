import React, { useState } from 'react';
import { Trophy, Star, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { OrangePowerupImp, PinkChibiMonster, GreenBubbleMonster } from './MonsterIcons';

export default function AnalogyQuest() {
  const questions = [
    { a: 'man', b: 'king', c: 'woman', options: ['queen', 'princess', 'palace', 'monarch'], correct: 'queen' },
    { a: 'france', b: 'paris', c: 'japan', options: ['tokyo', 'beijing', 'asia', 'country'], correct: 'tokyo' },
    { a: 'dog', b: 'puppy', c: 'cat', options: ['kitten', 'lion', 'animal', 'foal'], correct: 'kitten' },
    { a: 'good', b: 'better', c: 'bad', options: ['worse', 'worst', 'fast', 'small'], correct: 'worse' },
    { a: 'small', b: 'smaller', c: 'big', options: ['bigger', 'biggest', 'fast', 'fastest'], correct: 'bigger' }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt) => {
    if (answered) return;
    setSelectedOption(opt);
    setAnswered(true);
    if (opt === currentQ.correct) {
      setScore(prev => prev + 100);
      setXp(prev => prev + 50);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setXp(0);
    setSelectedOption(null);
    setAnswered(false);
    setQuizFinished(false);
  };

  const getRankTitle = () => {
    if (xp >= 200) return "👑 Level 5 Master Vector Explorer";
    if (xp >= 150) return "🧙‍♂️ Level 3 Vector Wizard";
    if (xp >= 100) return "🐉 Level 2 Imp Apprentice";
    return "👾 Level 1 Novice Imp";
  };

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
            Analogy Quest: Gamified Monster Quiz 🎮
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1">
            Solve vector analogy puzzles, gain XP, and level up your monster rank!
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-purple-950/90 px-4 py-2 rounded-2xl border-2 border-purple-500/40">
          <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
          <div>
            <span className="text-xs text-purple-300 font-bold block">Score: {score} XP</span>
            <span className="text-[10px] text-amber-300 font-black font-mono">{getRankTitle()}</span>
          </div>
        </div>
      </div>

      {!quizFinished ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-purple-900 rounded-full h-3 overflow-hidden border border-purple-700">
            <div
              className="bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 h-3 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Stage */}
          <div className="bg-purple-950/80 p-6 rounded-3xl border-2 border-pink-500/40 text-center space-y-4 shadow-xl">
            <span className="text-xs font-black text-pink-300 uppercase tracking-widest block font-mono">
              Question {currentIdx + 1} of {questions.length}
            </span>

            <div className="flex items-center justify-center space-x-3 text-lg font-black text-white font-mono">
              <span className="px-3 py-1 bg-purple-900 rounded-xl border border-purple-600 text-pink-300">{currentQ.a}</span>
              <span className="text-purple-400">:</span>
              <span className="px-3 py-1 bg-purple-900 rounded-xl border border-purple-600 text-amber-300">{currentQ.b}</span>
              <span className="text-purple-400">::</span>
              <span className="px-3 py-1 bg-purple-900 rounded-xl border border-purple-600 text-emerald-300">{currentQ.c}</span>
              <span className="text-purple-400">:</span>
              <span className="px-4 py-1 bg-amber-500/20 text-amber-300 rounded-xl border-2 border-amber-500/60 font-black animate-pulse">?</span>
            </div>

            <p className="text-xs text-purple-200 font-bold">
              Formula: vector({currentQ.b}) - vector({currentQ.a}) + vector({currentQ.c}) = ?
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correct;
              let style = "bg-purple-950/80 border-purple-500/40 text-purple-100 hover:border-pink-500";
              if (answered) {
                if (isCorrect) style = "bg-emerald-950/90 border-emerald-500 text-emerald-300 font-black scale-105";
                else if (isSelected) style = "bg-pink-950/90 border-pink-500 text-pink-300 opacity-60";
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={answered}
                  className={`p-4 text-sm font-black font-mono rounded-2xl border-2 transition-all shadow-md flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-pink-400" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {answered && (
            <button
              onClick={handleNext}
              className="w-full btn-candy-orange text-white text-sm font-black py-3.5 rounded-2xl shadow-xl animate-bounce"
            >
              {currentIdx + 1 === questions.length ? "Finish Quest 🏆" : "Next Question 🚀"}
            </button>
          )}
        </div>
      ) : (
        /* Quiz Finished Stage */
        <div className="bg-purple-950/90 p-8 rounded-3xl border-2 border-amber-500/50 text-center space-y-4 shadow-2xl">
          <Trophy className="w-16 h-16 text-amber-300 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-white">Quest Completed!</h3>
          <p className="text-sm font-bold text-emerald-300">
            Final Score: {score} XP — {getRankTitle()}
          </p>
          <button
            onClick={handleRestart}
            className="btn-candy-pink text-white text-xs font-black px-6 py-3 rounded-2xl shadow-lg inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Quest Again 🔄
          </button>
        </div>
      )}
    </div>
  );
}
