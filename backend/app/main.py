import os
import threading
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from app.model_manager import ModelManager

app = FastAPI(
    title="VecCompass API",
    description="Interactive Word Embedding Playground Backend (CBOW & Skip-gram)",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate global model manager singleton
model_manager = ModelManager()

# Initialize default corpus & pre-trained models on startup
SAMPLE_CORPUS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_corpus.txt"))

@app.on_event("startup")
def startup_event():
    if not model_manager.models:
        model_manager.initialize_default_corpus(SAMPLE_CORPUS_PATH)

# Initialize immediately for direct script execution
if not model_manager.models:
    model_manager.initialize_default_corpus(SAMPLE_CORPUS_PATH)

# Pydantic Request Models with Pydantic v2 protected namespace overrides
class CorpusUpdateRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw text corpus to train on")

class SelectModelRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str

class TrainRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_type: str = Field("pytorch_cbow", description="pytorch_cbow | pytorch_skipgram | gensim_cbow | gensim_skipgram")
    embedding_dim: int = Field(50, ge=10, le=300)
    window_size: int = Field(2, ge=1, le=10)
    epochs: int = Field(30, ge=1, le=200)
    learning_rate: float = Field(0.005, ge=0.0001, le=0.1)
    num_neg_samples: int = Field(5, ge=1, le=20)

class AnalogyRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    word_a: str
    word_b: str
    word_c: str
    model_name: str = None
    top_n: int = 5

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "VecCompass - Word Embedding Playground",
        "active_model": model_manager.active_model_name,
        "vocab_size": model_manager.vocab_info.get("vocab_size", 0)
    }

@app.get("/api/corpus-info")
def get_corpus_info():
    vocab_info = model_manager.vocab_info
    freq_buckets = vocab_info.get("freq_buckets", {})
    bucket_counts = {"frequent": 0, "medium": 0, "rare": 0}
    for b in freq_buckets.values():
        bucket_counts[b] = bucket_counts.get(b, 0) + 1

    return {
        "total_tokens": len(model_manager.tokens),
        "vocab_size": vocab_info.get("vocab_size", 0),
        "freq_buckets_count": bucket_counts,
        "sample_words": vocab_info.get("sorted_words", [])[:20]
    }

@app.post("/api/corpus")
def update_corpus(req: CorpusUpdateRequest):
    model_manager.set_corpus(req.text)
    model_manager.initialize_default_corpus("")
    return {
        "message": "Corpus updated and vocabulary rebuilt successfully",
        "vocab_size": model_manager.vocab_info.get("vocab_size", 0),
        "tokens_count": len(model_manager.tokens)
    }

@app.get("/api/models")
def get_models():
    return {
        "active_model": model_manager.active_model_name,
        "available_models": model_manager.get_available_models()
    }

@app.post("/api/select-model")
def select_model(req: SelectModelRequest):
    if req.model_name not in model_manager.models:
        raise HTTPException(status_code=404, detail=f"Model '{req.model_name}' not trained yet.")
    model_manager.active_model_name = req.model_name
    return {"active_model": model_manager.active_model_name}

def run_background_training(req: TrainRequest):
    m_type = req.model_type
    if m_type == "pytorch_cbow":
        embeds, loss_hist = model_manager.trainer.train_cbow(
            model_manager.tokens,
            model_manager.vocab_info,
            embedding_dim=req.embedding_dim,
            window_size=req.window_size,
            epochs=req.epochs,
            lr=req.learning_rate,
            num_neg_samples=req.num_neg_samples
        )
    elif m_type == "pytorch_skipgram":
        embeds, loss_hist = model_manager.trainer.train_skipgram(
            model_manager.tokens,
            model_manager.vocab_info,
            embedding_dim=req.embedding_dim,
            window_size=req.window_size,
            epochs=req.epochs,
            lr=req.learning_rate,
            num_neg_samples=req.num_neg_samples
        )
    elif m_type in ["gensim_cbow", "gensim_skipgram"]:
        sg_flag = 1 if m_type == "gensim_skipgram" else 0
        sentences = [s.split() for s in model_manager.corpus_text.lower().split('.') if s.strip()]
        if not sentences:
            sentences = [model_manager.tokens]
        embeds, loss_hist = model_manager.trainer.train_gensim_word2vec(
            sentences,
            model_manager.vocab_info,
            sg=sg_flag,
            embedding_dim=req.embedding_dim,
            window_size=req.window_size,
            epochs=req.epochs
        )
    else:
        return

    model_manager.models[m_type] = embeds
    model_manager.loss_histories[m_type] = loss_hist
    model_manager.active_model_name = m_type
    model_manager.invalidate_coordinates_cache()

@app.post("/api/train")
def train_model(req: TrainRequest):
    if model_manager.trainer.is_training:
        raise HTTPException(status_code=400, detail="Training is already in progress.")

    thread = threading.Thread(target=run_background_training, args=(req,))
    thread.start()

    return {"message": f"Training initiated for {req.model_type}", "status": "started"}

@app.get("/api/train/status")
def get_train_status():
    active_history = model_manager.loss_histories.get(model_manager.active_model_name, [])
    return {
        "is_training": model_manager.trainer.is_training,
        "progress": round(model_manager.trainer.current_progress * 100, 1),
        "current_epoch": model_manager.trainer.current_epoch,
        "total_epochs": model_manager.trainer.total_epochs,
        "status_message": model_manager.trainer.status_message,
        "loss_history": active_history,
        "active_model": model_manager.active_model_name
    }

@app.get("/api/similar/{word}")
def get_similarity(word: str, model_name: str = None, top_n: int = 10):
    result = model_manager.get_nearest_neighbors(word, model_name=model_name, top_n=top_n)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@app.post("/api/analogy")
def post_analogy(req: AnalogyRequest):
    result = model_manager.solve_analogy(
        req.word_a, req.word_b, req.word_c,
        model_name=req.model_name,
        top_n=req.top_n
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/coordinates")
def get_coordinates(model_name: str = None):
    coords = model_manager.get_coordinates(model_name=model_name)
    return {
        "model_name": model_name or model_manager.active_model_name,
        "coordinates": coords
    }

@app.get("/api/semantic-walk")
def get_semantic_walk(word_start: str, word_end: str, model_name: str = None, steps: int = 8):
    result = model_manager.get_semantic_walk(word_start, word_end, model_name=model_name, steps=steps)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/benchmarks")
def get_benchmarks(model_name: str = None):
    return {
        "model_name": model_name or model_manager.active_model_name,
        "benchmarks": model_manager.get_benchmarks(model_name=model_name)
    }

@app.get("/api/export-vectors")
def export_vectors(model_name: str = None):
    return model_manager.export_vectors(model_name=model_name)

class ImportVectorsRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    vectors: dict
    model_name: str = "imported_custom"

@app.post("/api/import-vectors")
def import_vectors(req: ImportVectorsRequest):
    result = model_manager.import_vectors(req.vectors, model_name=req.model_name)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/compare-frequency")
def compare_frequency(model_name: str = None):
    metrics = model_manager.compare_frequency_buckets(model_name=model_name)
    return {
        "model_name": model_name or model_manager.active_model_name,
        "buckets": metrics
    }

@app.get("/api/compare-architectures")
def compare_architectures(word: str):
    cbow_name = "pytorch_cbow" if "pytorch_cbow" in model_manager.models else "gensim_cbow"
    sg_name = "pytorch_skipgram" if "pytorch_skipgram" in model_manager.models else "gensim_skipgram"

    cbow_res = model_manager.get_nearest_neighbors(word, model_name=cbow_name, top_n=8)
    sg_res = model_manager.get_nearest_neighbors(word, model_name=sg_name, top_n=8)

    return {
        "word": word,
        "cbow": {
            "model_name": cbow_name,
            "neighbors": cbow_res.get("neighbors", []) if "error" not in cbow_res else []
        },
        "skipgram": {
            "model_name": sg_name,
            "neighbors": sg_res.get("neighbors", []) if "error" not in sg_res else []
        }
    }
