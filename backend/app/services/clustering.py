import numpy as np
from typing import List, Dict, Any
from sklearn.cluster import AgglomerativeClustering

def cluster_embeddings(
    feedbacks: List[Dict[str, Any]],
    min_clusters: int = 2,
    max_clusters: int = 7
) -> Dict[int, List[Dict[str, Any]]]:
    n_samples = len(feedbacks)
    if n_samples == 0:
        return {}

    if n_samples == 1:
        return {0: feedbacks}

    vectors = np.array([f["embedding"] for f in feedbacks], dtype=np.float32)
    n_clusters = max(1, min(max_clusters, max(min_clusters, n_samples // 4)))
    if n_clusters >= n_samples:
        n_clusters = max(1, n_samples // 2)

    if n_clusters <= 1:
        return {0: feedbacks}

    clustering = AgglomerativeClustering(
        n_clusters=n_clusters,
        metric="cosine",
        linkage="average"
    )
    labels = clustering.fit_predict(vectors)

    clusters: Dict[int, List[Dict[str, Any]]] = {}
    for idx, label in enumerate(labels):
        cluster_id = int(label)
        if cluster_id not in clusters:
            clusters[cluster_id] = []
        clusters[cluster_id].append(feedbacks[idx])

    return clusters
