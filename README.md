# VecCompass — Interactive Word Embedding Playground

**VecCompass** is a full-stack interactive playground for training, exploring, and visualizing semantic word vector spaces learned using **Continuous Bag of Words (CBOW)** and **Skip-gram** architectures with **Negative Sampling**.

---

## 🌟 Key Features

1. **Self-Supervised Word Embedding Training from Scratch**
   - Implements CBOW and Skip-gram architectures with negative sampling ($P(w) \propto f(w)^{0.75}$).
   - Gensim Word2Vec baseline integration for benchmark comparison.
   - Dynamic corpus ingestion & token frequency bucketing (`frequent`, `medium`, `rare`).

2. **2D Semantic Vector Space Visualization**
   - Linear **PCA** and Non-linear **t-SNE** 2D projections.
   - Interactive Plotly scatter plot with frequency bucket color coding, vector lines, search highlights, and hover tooltips.

3. **Vector Similarity & Analogy Solver**
   - **Cosine Similarity Lookup**: Top-$N$ nearest neighbors with similarity score rankings.
   - **Analogy Solver**: Vector arithmetic $v_{\text{target}} = v_B - v_A + v_C$ (e.g. `king - man + woman = queen`).

4. **Frequent vs. Rare Word Analysis**
   - Empirical stability metrics, average top-1 / top-5 cosine similarity scores, and vector norm distributions.

5. **Side-by-Side Architecture Comparison**
   - Directly compares CBOW (smooth, fast on frequent words) vs. Skip-gram (sharp on rare words) for any query word.

6. **Interactive Training Dashboard**
   - Configurable hyperparameters: Embedding Dimension ($d$), Context Window ($k$), Epochs, Learning Rate ($\eta$), Negative Samples ($K$).
   - Real-time live loss curve chart and progress tracking.

---

## 🛠 Project Architecture

```
npl/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI REST endpoints & background tasks
│   │   ├── preprocessing.py     # Tokenization, vocab builder & negative sampler
│   │   ├── model_manager.py     # Model registry, caching & active model state
│   │   ├── vector_space.py      # Cosine similarity, analogies, PCA & t-SNE
│   │   └── models/
│   │       ├── cbow.py          # PyTorch CBOW architecture
│   │       ├── skipgram.py      # PyTorch Skip-gram architecture
│   │       └── trainer.py       # SGD training loop & Gensim integration
│   ├── data/
│   │   └── sample_corpus.txt    # Curated semantic training corpus
│   └── run.py                   # Backend launcher script
├── frontend/                    # React + Vite + Plotly.js + Tailwind CSS
│   ├── src/
│   │   ├── components/          # Interactive UI components
│   │   └── services/api.js      # Axios REST API client
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server (FastAPI)
```bash
cd backend
python run.py
```
*The backend API will start on `http://127.0.0.1:8000`.*

### 2. Start the Frontend Application (React + Vite)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🛰 REST API Endpoints

- `GET /api/corpus-info` — Returns corpus token count, vocabulary size, and frequency buckets.
- `POST /api/corpus` — Updates corpus text and rebuilds vocabulary.
- `GET /api/models` — Lists available models and active model selection.
- `POST /api/select-model` — Sets active embedding model.
- `POST /api/train` — Launches training run with configurable hyperparameters.
- `GET /api/train/status` — Returns live training status and loss history.
- `GET /api/similar/{word}` — Returns top-$N$ nearest neighbors by cosine similarity.
- `POST /api/analogy` — Solves vector analogy formula $v_B - v_A + v_C$.
- `GET /api/coordinates` — Returns 2D PCA and t-SNE coordinates for vocabulary plotting.
- `GET /api/compare-frequency` — Evaluates quality metrics for frequent vs. rare word buckets.
- `GET /api/compare-architectures` — Side-by-side comparison of CBOW vs. Skip-gram.
