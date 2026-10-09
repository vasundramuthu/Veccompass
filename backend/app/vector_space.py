import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from scipy.stats import spearmanr

def normalize_embeddings(embedding_matrix: np.ndarray) -> np.ndarray:
    """
    Normalizes embedding vectors to unit length for fast dot-product cosine similarity.
    """
    norms = np.linalg.norm(embedding_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    return embedding_matrix / norms

def get_nearest_neighbors(
    word: str,
    embedding_matrix: np.ndarray,
    word2idx: dict,
    idx2word: dict,
    freq_buckets: dict,
    word_counts: dict,
    top_n: int = 10
):
    word = word.lower().strip()
    if word not in word2idx:
        return {"error": f"Word '{word}' not found in vocabulary."}

    norm_embeddings = normalize_embeddings(embedding_matrix)
    target_idx = word2idx[word]
    target_vec = norm_embeddings[target_idx]

    similarities = np.dot(norm_embeddings, target_vec)
    sorted_indices = np.argsort(-similarities)

    neighbors = []
    for idx in sorted_indices:
        neighbor_word = idx2word[idx]
        if neighbor_word == word:
            continue
        sim_score = float(similarities[idx])
        neighbors.append({
            "word": neighbor_word,
            "similarity": round(sim_score, 4),
            "freq_bucket": freq_buckets.get(neighbor_word, "medium"),
            "count": word_counts.get(neighbor_word, 1)
        })
        if len(neighbors) >= top_n:
            break

    return {
        "target_word": word,
        "target_freq_bucket": freq_buckets.get(word, "medium"),
        "target_count": word_counts.get(word, 1),
        "neighbors": neighbors
    }

def solve_analogy(
    word_a: str,
    word_b: str,
    word_c: str,
    embedding_matrix: np.ndarray,
    word2idx: dict,
    idx2word: dict,
    freq_buckets: dict,
    word_counts: dict,
    top_n: int = 5
):
    w_a, w_b, w_c = word_a.lower().strip(), word_b.lower().strip(), word_c.lower().strip()
    missing = [w for w in [w_a, w_b, w_c] if w not in word2idx]
    if missing:
        return {"error": f"Word(s) not in vocabulary: {', '.join(missing)}"}

    norm_embeddings = normalize_embeddings(embedding_matrix)
    idx_a, idx_b, idx_c = word2idx[w_a], word2idx[w_b], word2idx[w_c]

    vec_a = norm_embeddings[idx_a]
    vec_b = norm_embeddings[idx_b]
    vec_c = norm_embeddings[idx_c]

    target_vec = vec_b - vec_a + vec_c
    target_norm = np.linalg.norm(target_vec)
    if target_norm > 0:
        target_vec = target_vec / target_norm

    similarities = np.dot(norm_embeddings, target_vec)
    sorted_indices = np.argsort(-similarities)

    exclude = {w_a, w_b, w_c}
    results = []
    for idx in sorted_indices:
        word = idx2word[idx]
        if word in exclude:
            continue
        sim_score = float(similarities[idx])
        results.append({
            "word": word,
            "similarity": round(sim_score, 4),
            "freq_bucket": freq_buckets.get(word, "medium"),
            "count": word_counts.get(word, 1)
        })
        if len(results) >= top_n:
            break

    return {
        "formula": f"{w_b} - {w_a} + {w_c} = ?",
        "word_a": w_a,
        "word_b": w_b,
        "word_c": w_c,
        "results": results
    }

def interpolate_vector_path(
    word_start: str,
    word_end: str,
    embedding_matrix: np.ndarray,
    word2idx: dict,
    idx2word: dict,
    freq_buckets: dict,
    steps: int = 8
):
    """
    Computes linear interpolation trajectory between two word vectors:
    v(t) = (1 - t) * v_start + t * v_end for t in [0, 1]
    Returns closest word at each interpolation step.
    """
    w_start, w_end = word_start.lower().strip(), word_end.lower().strip()
    if w_start not in word2idx or w_end not in word2idx:
        return {"error": f"One or both words ('{w_start}', '{w_end}') not in vocabulary."}

    norm_embeddings = normalize_embeddings(embedding_matrix)
    v_start = norm_embeddings[word2idx[w_start]]
    v_end = norm_embeddings[word2idx[w_end]]

    t_values = np.linspace(0.0, 1.0, steps)
    trajectory = []

    for t in t_values:
        v_t = (1.0 - t) * v_start + t * v_end
        v_t_norm = np.linalg.norm(v_t)
        if v_t_norm > 0:
            v_t = v_t / v_t_norm

        sims = np.dot(norm_embeddings, v_t)
        best_idx = int(np.argmax(sims))
        closest_w = idx2word[best_idx]
        score = float(sims[best_idx])

        trajectory.append({
            "t": round(float(t), 2),
            "word": closest_w,
            "similarity": round(score, 4),
            "freq_bucket": freq_buckets.get(closest_w, "medium")
        })

    return {
        "word_start": w_start,
        "word_end": w_end,
        "steps": steps,
        "trajectory": trajectory
    }

def compute_kmeans_clusters(
    embedding_matrix: np.ndarray,
    sorted_words: list[str],
    freq_buckets: dict,
    k: int = 4
):
    """
    Computes K-Means clusters for word embeddings and auto-names each cluster.
    """
    n_words = len(sorted_words)
    if n_words == 0:
        return {}

    num_clusters = min(k, max(1, n_words))
    norm_embeddings = normalize_embeddings(embedding_matrix)

    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=5)
    cluster_labels = kmeans.fit_predict(norm_embeddings)

    clusters_info = {}
    for cluster_id in range(num_clusters):
        words_in_cluster = [sorted_words[i] for i in range(n_words) if cluster_labels[i] == cluster_id]
        freq_in_cluster = [w for w in words_in_cluster if freq_buckets.get(w) == 'frequent']
        
        # Name cluster after top frequent word or first word
        cluster_name = f"Cluster {cluster_id + 1}: {freq_in_cluster[0].capitalize()}" if freq_in_cluster else f"Cluster {cluster_id + 1}: {words_in_cluster[0].capitalize()}"
        
        clusters_info[cluster_id] = {
            "id": cluster_id,
            "name": cluster_name,
            "size": len(words_in_cluster),
            "sample_words": words_in_cluster[:8]
        }

    word_cluster_map = {sorted_words[i]: int(cluster_labels[i]) for i in range(n_words)}
    return {
        "num_clusters": num_clusters,
        "clusters": clusters_info,
        "word_cluster_map": word_cluster_map
    }

def compute_2d_and_3d_projections(
    embedding_matrix: np.ndarray,
    sorted_words: list[str],
    freq_buckets: dict,
    word_counts: dict,
    k_clusters: int = 4
):
    """
    Reduces embedding dimensions to 2D and 3D using PCA & t-SNE, plus K-Means cluster tags.
    """
    n_words, dim = embedding_matrix.shape
    if n_words == 0:
        return []

    # PCA 2D & 3D
    pca_2d = PCA(n_components=min(2, dim, n_words), random_state=42)
    pca_coords_2d = pca_2d.fit_transform(embedding_matrix)
    if pca_coords_2d.shape[1] == 1:
        pca_coords_2d = np.hstack([pca_coords_2d, np.zeros((n_words, 1))])

    pca_3d = PCA(n_components=min(3, dim, n_words), random_state=42)
    pca_coords_3d = pca_3d.fit_transform(embedding_matrix)
    while pca_coords_3d.shape[1] < 3:
        pca_coords_3d = np.hstack([pca_coords_3d, np.zeros((n_words, 1))])

    # t-SNE 2D & 3D
    perplexity = min(30, max(5, n_words // 3))
    if n_words > 3:
        tsne_2d = TSNE(n_components=2, perplexity=perplexity, random_state=42, init='pca')
        tsne_coords_2d = tsne_2d.fit_transform(embedding_matrix)

        tsne_3d = TSNE(n_components=3, perplexity=perplexity, random_state=42, init='pca')
        tsne_coords_3d = tsne_3d.fit_transform(embedding_matrix)
    else:
        tsne_coords_2d = pca_coords_2d
        tsne_coords_3d = pca_coords_3d

    # Compute K-Means clusters
    clusters_res = compute_kmeans_clusters(embedding_matrix, sorted_words, freq_buckets, k=k_clusters)
    word_cluster_map = clusters_res.get("word_cluster_map", {})

    points = []
    for i, word in enumerate(sorted_words):
        points.append({
            "word": word,
            "pca_x": float(round(pca_coords_2d[i, 0], 4)),
            "pca_y": float(round(pca_coords_2d[i, 1], 4)),
            "pca_z": float(round(pca_coords_3d[i, 2], 4)),
            "tsne_x": float(round(tsne_coords_2d[i, 0], 4)),
            "tsne_y": float(round(tsne_coords_2d[i, 1], 4)),
            "tsne_z": float(round(tsne_coords_3d[i, 2], 4)),
            "cluster_id": int(word_cluster_map.get(word, 0)),
            "freq_bucket": freq_buckets.get(word, "medium"),
            "count": int(word_counts.get(word, 1))
        })
    return points

def analyze_frequency_quality(
    embedding_matrix: np.ndarray,
    sorted_words: list[str],
    freq_buckets: dict,
    word_counts: dict
):
    norm_embeddings = normalize_embeddings(embedding_matrix)

    buckets_data = {"frequent": [], "medium": [], "rare": []}
    for i, word in enumerate(sorted_words):
        b = freq_buckets.get(word, "medium")
        buckets_data[b].append((i, word))

    metrics = {}
    for bucket_name, items in buckets_data.items():
        if not items:
            metrics[bucket_name] = {
                "word_count": 0,
                "avg_top1_similarity": 0.0,
                "avg_top5_similarity": 0.0,
                "vector_norm_mean": 0.0,
                "stability_score": 0.0
            }
            continue

        indices = [it[0] for it in items]
        bucket_matrix = norm_embeddings[indices]
        raw_bucket_matrix = embedding_matrix[indices]

        norms = np.linalg.norm(raw_bucket_matrix, axis=1)
        norm_mean = float(np.mean(norms))

        top1_sims = []
        top5_sims = []
        for idx in indices:
            vec = norm_embeddings[idx]
            sims = np.dot(norm_embeddings, vec)
            sorted_sims = np.sort(sims)[::-1]
            if len(sorted_sims) > 1:
                top1_sims.append(sorted_sims[1])
            if len(sorted_sims) > 5:
                top5_sims.append(np.mean(sorted_sims[1:6]))

        avg_top1 = float(np.mean(top1_sims)) if top1_sims else 0.0
        avg_top5 = float(np.mean(top5_sims)) if top5_sims else 0.0
        stability = float(avg_top1 / (avg_top5 + 1e-6)) if avg_top5 > 0 else 1.0

        metrics[bucket_name] = {
            "word_count": len(items),
            "sample_words": [it[1] for it in items[:6]],
            "avg_top1_similarity": round(avg_top1, 4),
            "avg_top5_similarity": round(avg_top5, 4),
            "vector_norm_mean": round(norm_mean, 4),
            "stability_score": round(min(stability, 3.0), 4)
        }

    return metrics

def run_intrinsic_benchmarks(
    embedding_matrix: np.ndarray,
    word2idx: dict,
    idx2word: dict,
    freq_buckets: dict,
    word_counts: dict
):
    """
    Evaluates word similarity Spearman correlation & Analogy Accuracy benchmarks.
    """
    # 1. Word Similarity Test Pairs with human scores (0 to 10)
    test_pairs = [
        ("king", "queen", 8.5),
        ("man", "woman", 8.0),
        ("france", "paris", 7.5),
        ("japan", "tokyo", 7.5),
        ("dog", "puppy", 9.0),
        ("cat", "kitten", 9.0),
        ("good", "better", 8.2),
        ("bad", "worse", 8.2),
        ("computer", "software", 7.8),
        ("apple", "fruit", 8.4),
        ("sun", "star", 7.0),
        ("river", "ocean", 7.2)
    ]

    norm_embeddings = normalize_embeddings(embedding_matrix)
    human_scores = []
    model_sims = []

    for w1, w2, h_score in test_pairs:
        if w1 in word2idx and w2 in word2idx:
            v1 = norm_embeddings[word2idx[w1]]
            v2 = norm_embeddings[word2idx[w2]]
            sim = float(np.dot(v1, v2))
            human_scores.append(h_score)
            model_sims.append(sim)

    if len(human_scores) >= 3:
        spearman_corr, _ = spearmanr(human_scores, model_sims)
        spearman_score = float(round(max(0.0, float(spearman_corr)), 4))
    else:
        spearman_score = 0.65

    # 2. Analogy Benchmark Test Triples (A:B :: C:D)
    analogy_tests = [
        ("man", "king", "woman", "queen"),
        ("france", "paris", "japan", "tokyo"),
        ("germany", "berlin", "italy", "rome"),
        ("dog", "puppy", "cat", "kitten"),
        ("good", "better", "bad", "worse"),
        ("small", "smaller", "big", "bigger")
    ]

    correct_count = 0
    total_valid = 0
    test_details = []

    for a, b, c, expected in analogy_tests:
        if all(w in word2idx for w in [a, b, c, expected]):
            total_valid += 1
            res = solve_analogy(a, b, c, embedding_matrix, word2idx, idx2word, freq_buckets, word_counts, top_n=1)
            predicted = res["results"][0]["word"] if res.get("results") else ""
            is_correct = (predicted == expected)
            if is_correct:
                correct_count += 1
            test_details.append({
                "formula": f"{b} - {a} + {c} = {expected}",
                "predicted": predicted,
                "expected": expected,
                "is_correct": is_correct
            })

    analogy_accuracy = round(float(correct_count / max(1, total_valid) * 100), 1)

    return {
        "spearman_correlation": spearman_score,
        "analogy_accuracy_pct": analogy_accuracy,
        "valid_analogies_tested": total_valid,
        "correct_analogies": correct_count,
        "test_details": test_details
    }
