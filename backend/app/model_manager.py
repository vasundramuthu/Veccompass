import os
import numpy as np
from app.preprocessing import clean_and_tokenize, build_vocabulary
from app.models.trainer import Trainer
from app.vector_space import (
    get_nearest_neighbors, solve_analogy, compute_2d_projections, analyze_frequency_quality
)

class ModelManager:
    """
    Singleton class that manages corpus, vocabulary, model training,
    active model selection, and coordinate caching.
    """
    def __init__(self):
        self.corpus_text = ""
        self.tokens = []
        self.vocab_info = {}
        self.models = {}
        self.loss_histories = {}
        self.coordinates_cache = {}
        self.active_model_name = "pytorch_cbow"
        self.trainer = Trainer()

    def initialize_default_corpus(self, sample_path: str):
        """
        Loads default corpus from file and trains initial baseline models so the application is ready immediately.
        """
        if os.path.exists(sample_path):
            with open(sample_path, "r", encoding="utf-8") as f:
                self.corpus_text = f.read()
        else:
            self.corpus_text = "The king sits on the throne in the royal palace. The queen rules the kingdom with grace."

        self.tokens = clean_and_tokenize(self.corpus_text)
        self.vocab_info = build_vocabulary(self.tokens, min_freq=1)

        # Train initial CBOW & Skip-gram models quickly (25 epochs)
        print("Training default CBOW model...")
        cbow_embeds, cbow_loss = self.trainer.train_cbow(
            self.tokens, self.vocab_info, embedding_dim=50, epochs=25, lr=0.02
        )
        self.models["pytorch_cbow"] = cbow_embeds
        self.loss_histories["pytorch_cbow"] = cbow_loss

        print("Training default Skip-gram model...")
        sg_embeds, sg_loss = self.trainer.train_skipgram(
            self.tokens, self.vocab_info, embedding_dim=50, epochs=25, lr=0.02
        )
        self.models["pytorch_skipgram"] = sg_embeds
        self.loss_histories["pytorch_skipgram"] = sg_loss

        # Train Gensim baselines
        sentences = [sentence.split() for sentence in self.corpus_text.lower().split('.') if sentence.strip()]
        if not sentences:
            sentences = [self.tokens]

        print("Training default Gensim CBOW & Skipgram baselines...")
        g_cbow_embeds, g_cbow_loss = self.trainer.train_gensim_word2vec(sentences, self.vocab_info, sg=0, epochs=25)
        self.models["gensim_cbow"] = g_cbow_embeds
        self.loss_histories["gensim_cbow"] = g_cbow_loss

        g_sg_embeds, g_sg_loss = self.trainer.train_gensim_word2vec(sentences, self.vocab_info, sg=1, epochs=25)
        self.models["gensim_skipgram"] = g_sg_embeds
        self.loss_histories["gensim_skipgram"] = g_sg_loss

        # Precompute initial 2D coordinates for active model
        self.invalidate_coordinates_cache()

    def invalidate_coordinates_cache(self):
        self.coordinates_cache = {}
        for m_name, embeds in self.models.items():
            coords = compute_2d_projections(
                embeds,
                self.vocab_info['sorted_words'],
                self.vocab_info['freq_buckets'],
                self.vocab_info['word_counts']
            )
            self.coordinates_cache[m_name] = coords

    def set_corpus(self, text: str):
        self.corpus_text = text
        self.tokens = clean_and_tokenize(text)
        self.vocab_info = build_vocabulary(self.tokens, min_freq=1)
        self.models = {}
        self.loss_histories = {}
        self.coordinates_cache = {}

    def get_available_models(self):
        info = []
        for name in ["pytorch_cbow", "pytorch_skipgram", "gensim_cbow", "gensim_skipgram"]:
            if name in self.models:
                embed_dim = self.models[name].shape[1] if name in self.models else 50
                info.append({
                    "name": name,
                    "display_name": {
                        "pytorch_cbow": "PyTorch CBOW (Custom)",
                        "pytorch_skipgram": "PyTorch Skip-gram (Custom)",
                        "gensim_cbow": "Gensim CBOW (Baseline)",
                        "gensim_skipgram": "Gensim Skip-gram (Baseline)"
                    }.get(name, name),
                    "architecture": "cbow" if "cbow" in name else "skipgram",
                    "framework": "pytorch" if "pytorch" in name else "gensim",
                    "embedding_dim": embed_dim,
                    "is_active": name == self.active_model_name
                })
        return info

    def get_active_embeddings(self, model_name: str = None):
        target_name = model_name or self.active_model_name
        if target_name not in self.models:
            target_name = list(self.models.keys())[0]
        return self.models[target_name]

    def get_nearest_neighbors(self, word: str, model_name: str = None, top_n: int = 10):
        embeds = self.get_active_embeddings(model_name)
        return get_nearest_neighbors(
            word, embeds,
            self.vocab_info['word2idx'],
            self.vocab_info['idx2word'],
            self.vocab_info['freq_buckets'],
            self.vocab_info['word_counts'],
            top_n=top_n
        )

    def solve_analogy(self, word_a: str, word_b: str, word_c: str, model_name: str = None, top_n: int = 5):
        embeds = self.get_active_embeddings(model_name)
        return solve_analogy(
            word_a, word_b, word_c, embeds,
            self.vocab_info['word2idx'],
            self.vocab_info['idx2word'],
            self.vocab_info['freq_buckets'],
            self.vocab_info['word_counts'],
            top_n=top_n
        )

    def get_coordinates(self, model_name: str = None):
        target_name = model_name or self.active_model_name
        if target_name not in self.coordinates_cache:
            if target_name in self.models:
                coords = compute_2d_and_3d_projections(
                    self.models[target_name],
                    self.vocab_info['sorted_words'],
                    self.vocab_info['freq_buckets'],
                    self.vocab_info['word_counts']
                )
                self.coordinates_cache[target_name] = coords
            else:
                return []
        return self.coordinates_cache[target_name]

    def get_semantic_walk(self, word_start: str, word_end: str, model_name: str = None, steps: int = 8):
        embeds = self.get_active_embeddings(model_name)
        return interpolate_vector_path(
            word_start, word_end, embeds,
            self.vocab_info['word2idx'],
            self.vocab_info['idx2word'],
            self.vocab_info['freq_buckets'],
            steps=steps
        )

    def get_benchmarks(self, model_name: str = None):
        embeds = self.get_active_embeddings(model_name)
        return run_intrinsic_benchmarks(
            embeds,
            self.vocab_info['word2idx'],
            self.vocab_info['idx2word'],
            self.vocab_info['freq_buckets'],
            self.vocab_info['word_counts']
        )

    def export_vectors(self, model_name: str = None):
        embeds = self.get_active_embeddings(model_name)
        sorted_words = self.vocab_info['sorted_words']
        vectors_dict = {}
        for i, w in enumerate(sorted_words):
            vectors_dict[w] = [float(round(val, 5)) for val in embeds[i]]
        return {
            "model_name": model_name or self.active_model_name,
            "vocab_size": len(sorted_words),
            "embedding_dim": embeds.shape[1],
            "vectors": vectors_dict
        }

    def import_vectors(self, vectors_dict: dict, model_name: str = "imported_custom"):
        words = list(vectors_dict.keys())
        if not words:
            return {"error": "Empty vectors dictionary."}

        dim = len(vectors_dict[words[0]])
        matrix = np.zeros((len(words), dim), dtype=np.float32)
        for i, w in enumerate(words):
            matrix[i] = np.array(vectors_dict[w], dtype=np.float32)

        self.tokens = words
        self.vocab_info = build_vocabulary(words, min_freq=1)
        self.models[model_name] = matrix
        self.active_model_name = model_name
        self.invalidate_coordinates_cache()
        return {"message": f"Successfully imported {len(words)} word vectors ({dim}D)", "active_model": model_name}

    def compare_frequency_buckets(self, model_name: str = None):
        embeds = self.get_active_embeddings(model_name)
        return analyze_frequency_quality(
            embeds,
            self.vocab_info['sorted_words'],
            self.vocab_info['freq_buckets'],
            self.vocab_info['word_counts']
        )
