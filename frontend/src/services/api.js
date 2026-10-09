import axios from 'axios';

const API_BASE = '/api';

export const api = {
  getCorpusInfo: async () => {
    const res = await axios.get(`${API_BASE}/corpus-info`);
    return res.data;
  },
  updateCorpus: async (text) => {
    const res = await axios.post(`${API_BASE}/corpus`, { text });
    return res.data;
  },
  getModels: async () => {
    const res = await axios.get(`${API_BASE}/models`);
    return res.data;
  },
  selectModel: async (model_name) => {
    const res = await axios.post(`${API_BASE}/select-model`, { model_name });
    return res.data;
  },
  trainModel: async (params) => {
    const res = await axios.post(`${API_BASE}/train`, params);
    return res.data;
  },
  getTrainStatus: async () => {
    const res = await axios.get(`${API_BASE}/train/status`);
    return res.data;
  },
  getNearestNeighbors: async (word, modelName = null, topN = 10) => {
    const params = { top_n: topN };
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/similar/${encodeURIComponent(word)}`, { params });
    return res.data;
  },
  solveAnalogy: async (wordA, wordB, wordC, modelName = null, topN = 5) => {
    const res = await axios.post(`${API_BASE}/analogy`, {
      word_a: wordA,
      word_b: wordB,
      word_c: wordC,
      model_name: modelName,
      top_n: topN
    });
    return res.data;
  },
  getCoordinates: async (modelName = null) => {
    const params = {};
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/coordinates`, { params });
    return res.data;
  },
  getSemanticWalk: async (wordStart, wordEnd, modelName = null, steps = 8) => {
    const params = { word_start: wordStart, word_end: wordEnd, steps };
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/semantic-walk`, { params });
    return res.data;
  },
  getBenchmarks: async (modelName = null) => {
    const params = {};
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/benchmarks`, { params });
    return res.data;
  },
  exportVectors: async (modelName = null) => {
    const params = {};
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/export-vectors`, { params });
    return res.data;
  },
  importVectors: async (vectors, modelName = "imported_custom") => {
    const res = await axios.post(`${API_BASE}/import-vectors`, { vectors, model_name: modelName });
    return res.data;
  },
  getFrequencyComparison: async (modelName = null) => {
    const params = {};
    if (modelName) params.model_name = modelName;
    const res = await axios.get(`${API_BASE}/compare-frequency`, { params });
    return res.data;
  },
  compareArchitectures: async (word) => {
    const res = await axios.get(`${API_BASE}/compare-architectures`, {
      params: { word }
    });
    return res.data;
  }
};
