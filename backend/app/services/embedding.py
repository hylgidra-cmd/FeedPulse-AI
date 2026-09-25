import hashlib
import numpy as np
from typing import List
from app.core.config import settings

def _generate_fallback_vector(text: str, dim: int = 1536) -> List[float]:
    tokens = text.lower().split()
    vector = np.zeros(dim, dtype=np.float32)
    for i, token in enumerate(tokens):
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        vector[idx] += 1.0 / (1.0 + (i * 0.05))
    
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    else:
        vector[0] = 1.0
    return vector.tolist()

async def get_embeddings(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []

    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.embeddings.create(
                input=texts,
                model=settings.EMBEDDING_MODEL or "text-embedding-3-small"
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            print(f"[Embedding Warning] OpenAI API failed: {e}. Falling back to deterministic embedding.")

    return [_generate_fallback_vector(t) for t in texts]

async def get_single_embedding(text: str) -> List[float]:
    vectors = await get_embeddings([text])
    return vectors[0]
