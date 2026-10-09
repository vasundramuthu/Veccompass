import React, { useState, useEffect } from 'react';
import { Sliders, Play, RefreshCw, TrendingDown } from 'lucide-react';
import { api } from '../services/api';
import { PurpleCauldronImp } from './MonsterIcons';

export default function TrainingPanel({ onTrainingComplete }) {
  const [modelType, setModelType] = useState('pytorch_cbow');
  const [embeddingDim, setEmbeddingDim] = useState(50);
  const [windowSize, setWindowSize] = useState(2);
  const [epochs, setEpochs] = useState(30);
  const [learningRate, setLearningRate] = useState(0.01);
  const [numNegSamples, setNumNegSamples] = useState(5);

  const [status, setStatus] = useState({
    is_training: false,
    progress: 0,
    current_epoch: 0,
    total_epochs: 0,
    status_message: 'Idle',
    loss_history: []
  });

  useEffect(() => {
    let interval = null;
    if (status.is_training) {
      interval = setInterval(pollStatus, 1000);
    }
    return () => clearInterval(interval);
  }, [status.is_training]);

  const pollStatus = async () => {
    try {
      const res = await api.getTrainStatus();
      setStatus(res);
      if (!res.is_training && status.is_training) {
        if (onTrainingComplete) onTrainingComplete();
      }
    } catch (err) {
      console.error("Failed to poll status:", err);
    }
  };

  const handleStartTrain = async () => {
    try {
      await api.trainModel({
        model_type: modelType,
        embedding_dim: Number(embeddingDim),
        window_size: Number(windowSize),
        epochs: Number(epochs),
        learning_rate: Number(learningRate),
        num_neg_samples: Number(numNegSamples)
      });
      setStatus(prev => ({ ...prev, is_training: true, status_message: 'Starting training...' }));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to launch training.");
    }
  };

  const lossPoints = status.loss_history || [];
  const maxLoss = lossPoints.length > 0 ? Math.max(...lossPoints.map(l => l.loss)) : 1;

  return (
    <div className="card-squishy p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/30 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PurpleCauldronImp className="w-6 h-6" />
            Interactive Training Cauldron 🧪
          </h2>
          <p className="text-xs text-purple-200 font-bold mt-1">
            Configure hyperparameters and observe real-time loss optimization
          </p>
        </div>

        <button
          onClick={handleStartTrain}
          disabled={status.is_training}
          className="btn-candy-pink text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {status.is_training ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Brewing Vectors...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Launch Training Run 🚀
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hyperparameters Controls */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-500/30 space-y-4">
          <h3 className="text-xs font-black text-pink-300 uppercase tracking-widest font-mono">
            Hyperparameter Spellbook
          </h3>

          <div>
            <label className="text-xs text-purple-200 font-bold block mb-1.5">Model Architecture</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pytorch_cbow', label: 'Custom CBOW 🍡' },
                { id: 'pytorch_skipgram', label: 'Custom Skip-gram 🚀' },
                { id: 'gensim_cbow', label: 'Gensim CBOW' },
                { id: 'gensim_skipgram', label: 'Gensim Skip-gram' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setModelType(opt.id)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border-2 font-mono text-left transition-all ${
                    modelType === opt.id
                      ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-md'
                      : 'bg-purple-900 border-purple-700 text-purple-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-200">Embedding Dimension (d):</span>
              <span className="text-amber-300 font-black font-mono">{embeddingDim}D</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={embeddingDim}
              onChange={(e) => setEmbeddingDim(e.target.value)}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-200">Context Window Size (k):</span>
              <span className="text-pink-300 font-black font-mono">±{windowSize} words</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={windowSize}
              onChange={(e) => setWindowSize(e.target.value)}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-purple-200">Training Epochs:</span>
              <span className="text-emerald-400 font-black font-mono">{epochs} epochs</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-purple-200 font-bold block mb-1">Learning Rate (η)</label>
              <input
                type="number"
                step="0.005"
                min="0.001"
                max="0.1"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                className="w-full bg-purple-900 border-2 border-purple-700 rounded-xl p-2 text-xs font-bold font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-purple-200 font-bold block mb-1">Negative Samples (K)</label>
              <input
                type="number"
                min="1"
                max="15"
                value={numNegSamples}
                onChange={(e) => setNumNegSamples(e.target.value)}
                className="w-full bg-purple-900 border-2 border-purple-700 rounded-xl p-2 text-xs font-bold font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Loss Curve */}
        <div className="bg-purple-950/80 p-5 rounded-3xl border-2 border-purple-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-emerald-300 uppercase tracking-widest font-mono flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Live Loss Optimization
              </h3>
              <span className="text-xs font-bold text-purple-200">{status.status_message}</span>
            </div>

            <div className="w-full bg-purple-900 rounded-full h-3 overflow-hidden border border-purple-700 mb-4">
              <div
                className="bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 h-3 transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>

            <div className="h-56 w-full bg-purple-900/60 rounded-2xl border-2 border-purple-500/30 p-3 flex flex-col justify-between relative">
              {lossPoints.length > 1 ? (
                <svg className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#00ff87"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={lossPoints.map((pt, i) => {
                      const x = (i / (lossPoints.length - 1)) * 100;
                      const y = 100 - (pt.loss / maxLoss) * 85;
                      return `${x}%,${y}%`;
                    }).join(' ')}
                  />
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-purple-300 font-bold">
                  Loss curve will plot live during training runs.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-purple-900/80 rounded-2xl border border-purple-500/30 text-xs text-purple-200 flex justify-between font-bold">
            <span>Current Epoch: {status.current_epoch} / {status.total_epochs}</span>
            <span>Latest Loss: {lossPoints.length > 0 ? lossPoints[lossPoints.length - 1].loss : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
