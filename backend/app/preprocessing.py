import re
import math
from collections import Counter
import numpy as np

def clean_and_tokenize(text: str):
    """
    Cleans raw text by lowercasing, stripping punctuation (keeping words/alphanumerics),
    and returning a list of word tokens.
    """
    # Convert to lowercase
    text = text.lower()
    # Replace non-alphanumeric characters (except whitespace) with space
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Split by whitespace
    tokens = text.split()
    return tokens

def build_vocabulary(tokens: list[str], min_freq: int = 1, frequent_pct: float = 0.3, rare_pct: float = 0.3):
    """
    Constructs vocabulary from tokens, filters by min_freq, and categorizes words
    into frequency buckets ('frequent', 'medium', 'rare').
    """
    counts = Counter(tokens)
    # Filter by min frequency
    filtered_counts = {w: c for w, c in counts.items() if c >= min_freq}
    if not filtered_counts:
        # Fallback if min_freq was too strict
        filtered_counts = dict(counts)

    # Sort vocabulary by frequency descending
    sorted_words = sorted(filtered_counts.keys(), key=lambda w: (-filtered_counts[w], w))

    word2idx = {w: i for i, w in enumerate(sorted_words)}
    idx2word = {i: w for i, w in enumerate(sorted_words)}
    vocab_size = len(sorted_words)

    # Determine frequency buckets
    freq_values = np.array([filtered_counts[w] for w in sorted_words])
    
    # Sort frequencies to compute percentiles
    unique_freqs = sorted(freq_values, reverse=True)
    if len(unique_freqs) == 1:
        freq_buckets = {w: 'medium' for w in sorted_words}
    else:
        freq_80 = np.percentile(freq_values, (1.0 - frequent_pct) * 100)
        freq_20 = np.percentile(freq_values, rare_pct * 100)

        freq_buckets = {}
        for w in sorted_words:
            c = filtered_counts[w]
            if c >= freq_80:
                freq_buckets[w] = 'frequent'
            elif c <= freq_20:
                freq_buckets[w] = 'rare'
            else:
                freq_buckets[w] = 'medium'

    return {
        'word2idx': word2idx,
        'idx2word': idx2word,
        'word_counts': filtered_counts,
        'freq_buckets': freq_buckets,
        'vocab_size': vocab_size,
        'sorted_words': sorted_words
    }

class NegativeSampler:
    """
    Draws negative samples according to unigram distribution raised to 3/4 power: P(w) ~ f(w)^0.75
    """
    def __init__(self, word_counts: dict, word2idx: dict, power: float = 0.75, table_size: int = 100000):
        self.word2idx = word2idx
        self.table_size = table_size
        
        counts = np.array([word_counts[w] for w in word2idx.keys()], dtype=np.float64)
        pow_counts = np.power(counts, power)
        probs = pow_counts / np.sum(pow_counts)
        
        # Build discrete alias sampling table or cumulative sum for fast sampling
        self.probs = probs
        self.vocab_size = len(word2idx)

    def sample(self, count: int, exclude_indices: set = None) -> list[int]:
        """
        Draw `count` negative sample indices, optionally excluding positive indices.
        """
        samples = []
        while len(samples) < count:
            draws = np.random.choice(self.vocab_size, size=count * 2, p=self.probs)
            for idx in draws:
                if exclude_indices is None or idx not in exclude_indices:
                    samples.append(int(idx))
                    if len(samples) == count:
                        break
        return samples

def generate_cbow_dataset(tokens: list[str], word2idx: dict, window_size: int = 2):
    """
    Generates dataset for CBOW model:
    Each sample is (context_indices, target_index)
    where context_indices is a fixed-size or variable-size list of indices of surrounding words.
    """
    dataset = []
    token_indices = [word2idx[t] for t in tokens if t in word2idx]
    n = len(token_indices)

    for i in range(n):
        start = max(0, i - window_size)
        end = min(n, i + window_size + 1)
        context = [token_indices[j] for j in range(start, end) if j != i]
        if len(context) > 0:
            target = token_indices[i]
            dataset.append((context, target))
    return dataset

def generate_skipgram_dataset(tokens: list[str], word2idx: dict, window_size: int = 2):
    """
    Generates dataset for Skip-gram model:
    Each sample is (target_index, context_index)
    """
    dataset = []
    token_indices = [word2idx[t] for t in tokens if t in word2idx]
    n = len(token_indices)

    for i in range(n):
        target = token_indices[i]
        start = max(0, i - window_size)
        end = min(n, i + window_size + 1)
        for j in range(start, end):
            if j != i:
                context = token_indices[j]
                dataset.append((target, context))
    return dataset
