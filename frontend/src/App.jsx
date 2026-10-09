import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import NearestNeighbors from './components/NearestNeighbors';
import AnalogySolver from './components/AnalogySolver';
import EmbeddingPlot from './components/EmbeddingPlot';
import SemanticWalk from './components/SemanticWalk';
import FrequencyComparison from './components/FrequencyComparison';
import BenchmarkSuite from './components/BenchmarkSuite';
import AnalogyQuest from './components/AnalogyQuest';
import ModelComparison from './components/ModelComparison';
import TrainingPanel from './components/TrainingPanel';
import CorpusEditor from './components/CorpusEditor';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [models, setModels] = useState([]);
  const [activeModel, setActiveModel] = useState('pytorch_cbow');
  const [corpusInfo, setCorpusInfo] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedWordFromPlot, setSelectedWordFromPlot] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [modelsData, infoData] = await Promise.all([
        api.getModels(),
        api.getCorpusInfo()
      ]);
      setModels(modelsData.available_models || []);
      setActiveModel(modelsData.active_model || 'pytorch_cbow');
      setCorpusInfo(infoData);
    } catch (err) {
      console.error("Failed to load initial data from API:", err);
    }
  };

  const handleSelectModel = async (modelName) => {
    try {
      await api.selectModel(modelName);
      setActiveModel(modelName);
    } catch (err) {
      console.error("Failed to select model:", err);
    }
  };

  const handleSelectWord = (word) => {
    setSelectedWordFromPlot(word);
  };

  return (
    <div className="min-h-screen bg-purple-950/40 text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        models={models}
        activeModel={activeModel}
        onSelectModel={handleSelectModel}
        corpusInfo={corpusInfo}
        isTraining={isTraining}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Explore & 2D/3D Vector Space */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <ArchitectureDiagram />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[680px]">
              <div className="lg:col-span-5 flex flex-col space-y-6 h-full">
                <div className="flex-1">
                  <NearestNeighbors
                    activeModel={activeModel}
                    onSelectWordForPlot={handleSelectWord}
                    selectedWordFromPlot={selectedWordFromPlot}
                  />
                </div>
                <div className="flex-1">
                  <AnalogySolver
                    activeModel={activeModel}
                    onSelectWordForPlot={handleSelectWord}
                  />
                </div>
              </div>

              <div className="lg:col-span-7 h-full">
                <EmbeddingPlot
                  activeModel={activeModel}
                  highlightedWord={selectedWordFromPlot}
                  onSelectWord={handleSelectWord}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Semantic Walk Linear Interpolation */}
        {activeTab === 'walk' && (
          <SemanticWalk activeModel={activeModel} />
        )}

        {/* Tab 3: Side-by-side Architecture Battle */}
        {activeTab === 'compare' && (
          <ModelComparison />
        )}

        {/* Tab 4: Frequency & Intrinsic Benchmark Suite */}
        {activeTab === 'frequency' && (
          <div className="space-y-6">
            <FrequencyComparison activeModel={activeModel} />
            <BenchmarkSuite activeModel={activeModel} onVectorsImported={fetchInitialData} />
          </div>
        )}

        {/* Tab 5: Gamified Analogy Quest */}
        {activeTab === 'quest' && (
          <AnalogyQuest />
        )}

        {/* Tab 6: Interactive Training Cauldron */}
        {activeTab === 'training' && (
          <TrainingPanel onTrainingComplete={fetchInitialData} />
        )}

        {/* Tab 7: Corpus Inspector & Vector JSON I/O */}
        {activeTab === 'corpus' && (
          <CorpusEditor
            corpusInfo={corpusInfo}
            onCorpusUpdated={fetchInitialData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-purple-900/60 py-6 text-center text-xs text-purple-300 font-bold font-mono">
        VecCompass — Ultimate Gamified Word Embedding &amp; Benchmark Playground (CBOW &amp; Skip-gram) 👾
      </footer>
    </div>
  );
}
