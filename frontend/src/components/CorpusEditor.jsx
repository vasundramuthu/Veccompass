import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function CorpusEditor({ corpusInfo, onCorpusUpdated }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const techCorpus = `Computer science explores algorithms, software, and machine learning models. Deep learning uses neural networks with input, hidden, and output layers. Word embeddings map tokens to dense continuous vectors. CBOW predicts target words from surrounding context. Skipgram predicts context words given target words. Python and PyTorch power backend server algorithms. Vector space cosine similarity enables semantic search.`;

  const scienceCorpus = `Biology studies living organisms, cells, genetics, and ecosystems. DNA carries genetic information inside cell nuclei. Proteins perform essential biological functions and cellular structures. Evolution shapes species diversity across planet Earth. Plants produce oxygen through photosynthesis using sunlight. Water, air, and soil nourish complex ecological systems.`;

  useEffect(() => {
    fetchCurrentCorpus();
  }, []);

  const fetchCurrentCorpus = async () => {
    try {
      const info = await api.getCorpusInfo();
      setText(info.sample_words ? info.sample_words.join(' ') : '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (corpusText = text) => {
    if (!corpusText.trim()) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      await api.updateCorpus(corpusText);
      setSuccessMsg('Corpus updated and vocabulary rebuilt successfully!');
      if (onCorpusUpdated) onCorpusUpdated();
    } catch (err) {
      alert("Failed to update corpus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Corpus Inspector &amp; Custom Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide custom unstructured text to train word vectors on your own domain
          </p>
        </div>

        <button
          onClick={() => handleUpdate()}
          disabled={loading}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Rebuilding Vocab &amp; Training...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Update &amp; Retrain Corpus
            </>
          )}
        </button>
      </div>

      {/* Preset domain corpus buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-mono">Load Domain Preset:</span>
        <button
          onClick={() => {
            setText(techCorpus);
            handleUpdate(techCorpus);
          }}
          className="px-3 py-1 bg-slate-950 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-mono hover:bg-slate-800"
        >
          AI &amp; Tech Corpus
        </button>
        <button
          onClick={() => {
            setText(scienceCorpus);
            handleUpdate(scienceCorpus);
          }}
          className="px-3 py-1 bg-slate-950 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono hover:bg-slate-800"
        >
          Biology &amp; Science Corpus
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Textarea */}
      <div>
        <label className="text-xs font-mono text-slate-400 block mb-2">Raw Text Dataset Input</label>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste raw text dataset here..."
          className="w-full bg-slate-950 text-slate-200 text-xs font-mono p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 leading-relaxed"
        />
      </div>

      {/* Corpus stats breakdown */}
      {corpusInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">Total Word Tokens</span>
            <span className="text-xl font-bold text-white font-mono">{corpusInfo.total_tokens}</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">Unique Vocabulary Size</span>
            <span className="text-xl font-bold text-brand-400 font-mono">{corpusInfo.vocab_size}</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">Frequency Buckets</span>
            <div className="flex gap-2 text-xs font-mono mt-1">
              <span className="text-brand-300">{corpusInfo.freq_buckets_count?.frequent || 0} Frequent</span>
              <span className="text-amber-300">{corpusInfo.freq_buckets_count?.rare || 0} Rare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
