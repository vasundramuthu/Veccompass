import React, { useState, useEffect } from 'react';
import { Award, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster, OrangePowerupImp } from './MonsterIcons';

export default function BenchmarkSuite({ activeModel, onVectorsImported }) {
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    fetchBenchmarks();
  }, [activeModel]);

  const fetchBenchmarks = async () => {
    setLoading(true);
    try {
      const res = await api.getBenchmarks(activeModel);
      setBenchmarks(res.benchmarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.exportVectors(activeModel);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veccompass_${activeModel}_vectors.json`;
      a.click();
    } catch (err) {
      alert("Failed to export vectors.");
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const vectors = json.vectors || json;
        const res = await api.importVectors(vectors, "custom_imported");
        setImportStatus(res.message);
        if (onVectorsImported) onVectorsImported();
      } catch (err) {
        alert("Invalid vector JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  if (loading || !benchmarks) {
    return (
      <div className="card-squishy p-8 text-center text-purple-200 font-bold text-sm">
        Running Intrinsic Benchmark Suite... 📊
      </div>
    );
  }

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-300" />
            Intrinsic Evaluation &amp; Vector I/O Hub
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1">
            Word similarity correlation, analogy accuracy benchmarks &amp; export tools
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn-candy-purple text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <label className="btn-candy-pink text-white text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md">
            <Upload className="w-4 h-4" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Benchmark Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Spearman Rank Correlation */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-pink-500/40 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
            <span className="font-black text-sm text-pink-300">Word Similarity Spearman Correlation (ρ)</span>
            <span className="text-xs px-2.5 py-0.5 bg-pink-500/30 text-pink-200 rounded-full font-mono font-black">
              Gold Test Pairs
            </span>
          </div>

          <div className="text-center py-4">
            <span className="text-4xl font-black text-amber-300 font-mono block animate-bounce">
              {benchmarks.spearman_correlation}
            </span>
            <span className="text-xs text-purple-200 font-bold mt-1 block">
              Spearman Rank Correlation Coefficient
            </span>
          </div>

          <div className="p-3 bg-purple-900/60 rounded-2xl border border-purple-500/30 text-xs text-purple-200">
            Measures how tightly model cosine similarities align with human judgment scores across word pairs.
          </div>
        </div>

        {/* Card 2: Analogy Accuracy */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
            <span className="font-black text-sm text-emerald-300">Analogy Accuracy %</span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-full font-mono font-black">
              A : B :: C : D
            </span>
          </div>

          <div className="text-center py-4">
            <span className="text-4xl font-black text-emerald-400 font-mono block animate-bounce">
              {benchmarks.analogy_accuracy_pct}%
            </span>
            <span className="text-xs text-purple-200 font-bold mt-1 block">
              {benchmarks.correct_analogies} of {benchmarks.valid_analogies_tested} test analogies solved
            </span>
          </div>

          <div className="space-y-1.5">
            {benchmarks.test_details && benchmarks.test_details.map((t, idx) => (
              <div key={idx} className="p-2 bg-purple-900/60 rounded-xl border border-purple-500/30 flex justify-between items-center text-[11px] font-mono">
                <span className="text-purple-200">{t.formula}</span>
                <span className={t.is_correct ? "text-emerald-400 font-bold" : "text-pink-400"}>
                  {t.is_correct ? "✔ Correct" : `✘ (${t.predicted})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
