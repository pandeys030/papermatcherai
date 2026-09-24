"""Paper Matcher Service.

Performs semantic research paper recommendation using TF-IDF vectorization
and Cosine Similarity against the arXiv research paper corpus.
"""

import time
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any

import joblib
import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer

from app.core.exceptions import EngineNotInitializedException
from app.schemas.recommendation import PaperRecommendation
from app.services.dataset import get_dataset_loader

logger = logging.getLogger("papermatcher.matcher")


def _extract_year(date_str: Optional[str]) -> int:
    """Extract 4-digit calendar year from date string (e.g. '8/1/93', '5/1/24', '2024-05-10')."""
    if not date_str or not isinstance(date_str, str):
        return -1
    parts = date_str.strip().split("/")
    if parts:
        try:
            y = int(parts[-1])
            if y < 100:
                return 1900 + y if y >= 90 else 2000 + y
            return y
        except ValueError:
            pass
    # Fallback to prefix if hyphenated (e.g. '2024-05-10')
    if "-" in date_str:
        try:
            return int(date_str.split("-")[0])
        except ValueError:
            pass
    return -1


class PaperMatcher:
    """Core NLP recommendation engine using TF-IDF and Cosine Similarity."""

    def __init__(self, models_dir: Optional[Path] = None):
        if models_dir is None:
            project_root = Path(__file__).resolve().parent.parent.parent.parent
            self.models_dir = project_root / "models"
        else:
            self.models_dir = Path(models_dir)

        self.vectorizer: Optional[TfidfVectorizer] = None
        self.paper_matrix: Optional[sp.csr_matrix] = None
        self.paper_metadata: Optional[List[Dict[str, Any]]] = None
        self.category_codes: Optional[np.ndarray] = None
        self.published_years: Optional[np.ndarray] = None
        self.is_initialized: bool = False

    def load_index(self, auto_build: bool = False) -> bool:
        """Load persisted TF-IDF vectorizer, sparse matrix, and metadata from disk.

        Args:
            auto_build: If True, builds the index if artifacts are missing.

        Returns:
            bool: True if loaded successfully, False otherwise.
        """
        vectorizer_path = self.models_dir / "tfidf_vectorizer.joblib"
        matrix_path = self.models_dir / "tfidf_matrix.npz"
        metadata_path = self.models_dir / "paper_metadata.joblib"

        artifacts_exist = (
            vectorizer_path.exists()
            and matrix_path.exists()
            and metadata_path.exists()
        )

        if not artifacts_exist:
            if auto_build:
                logger.info("Index artifacts not found. Initiating build...")
                from app.services.build_index import build_index
                build_index()
            else:
                logger.warning(
                    "Index artifacts missing in %s. Engine remains uninitialized.",
                    self.models_dir,
                )
                self.is_initialized = False
                return False

        logger.info("Loading TF-IDF artifacts from %s...", self.models_dir)
        t0 = time.time()

        self.vectorizer = joblib.load(vectorizer_path)
        self.paper_matrix = sp.load_npz(matrix_path)
        self.paper_metadata = joblib.load(metadata_path)

        # Pre-extract category codes and years into numpy arrays for fast vectorized filtering
        self.category_codes = np.array(
            [str(m.get("category_code", "")).strip().lower() for m in self.paper_metadata]
        )
        self.published_years = np.array(
            [_extract_year(m.get("published_date", "")) for m in self.paper_metadata],
            dtype=np.int32,
        )

        # Precompute dynamic filter options directly from metadata
        from collections import Counter
        cat_map = {}
        cat_counts = Counter()
        for m in self.paper_metadata:
            code = str(m.get("category_code", "")).strip()
            name = str(m.get("category", "")).strip()
            if code:
                cat_counts[code] += 1
                if code not in cat_map or len(name) > len(cat_map[code]):
                    cat_map[code] = name

        unique_years = sorted(
            [int(y) for y in set(self.published_years) if 1990 <= y <= 2030],
            reverse=True,
        )

        self.filter_options = {
            "categories": [
                {
                    "code": code,
                    "name": cat_map.get(code, code),
                    "count": count,
                }
                for code, count in cat_counts.most_common()
            ],
            "years": unique_years,
        }

        self.is_initialized = True

        load_time = time.time() - t0
        logger.info(
            "PaperMatcher initialized in %.2f seconds (Documents: %d, Features: %d).",
            load_time,
            self.paper_matrix.shape[0],
            self.paper_matrix.shape[1],
        )
        return True

    def get_filter_options(self) -> Dict[str, Any]:
        """Return available categories and years dynamically computed from the dataset."""
        if not self.is_initialized or self.filter_options is None:
            raise EngineNotInitializedException(
                "Recommendation engine is not initialized. Model and dataset must be loaded first."
            )
        return self.filter_options

    def recommend(
        self,
        query: str,
        top_k: int = 5,
        category_code: Optional[str] = None,
        published_year: Optional[int] = None,
    ) -> List[PaperRecommendation]:
        """Generate top-K paper recommendations for a given query text.

        Supports optional filters:
        - category_code: e.g. 'cs.CL', 'cs.AI', 'cs.CV'
        - published_year: e.g. 2024

        Steps:
        1. Clean and normalize query.
        2. Transform query into sparse TF-IDF vector.
        3. Compute cosine similarity via sparse matrix dot product.
        4. Apply optional filters if specified.
        5. Select top-K most similar documents.
        6. Map to metadata and return PaperRecommendation list.

        Raises:
            EngineNotInitializedException: If index artifacts are not loaded.
        """
        if not self.is_initialized or self.vectorizer is None or self.paper_matrix is None or self.paper_metadata is None:
            raise EngineNotInitializedException(
                "Recommendation engine is not initialized. Model and dataset must be loaded "
                "before generating recommendations."
            )

        # 1. Clean query
        loader = get_dataset_loader()
        clean_query = loader.preprocess_text(query)
        if not clean_query:
            return []

        # 2. Vectorize query using existing fitted vectorizer
        query_vec = self.vectorizer.transform([clean_query])

        # 3. Calculate cosine similarity via sparse matrix-vector dot product
        # Both the matrix rows and the query vector are L2-normalized,
        # so matrix.dot(query_vec.T) calculates exact cosine similarity in milliseconds.
        similarities = self.paper_matrix.dot(query_vec.T).toarray().ravel()

        num_docs = len(similarities)

        # 4. Handle optional filtering
        if category_code or published_year is not None:
            mask = np.ones(num_docs, dtype=bool)
            if category_code:
                target_code = category_code.strip().lower()
                mask = mask & (self.category_codes == target_code)
            if published_year is not None:
                mask = mask & (self.published_years == published_year)

            candidate_indices = np.where(mask)[0]
            if len(candidate_indices) == 0:
                return []

            sub_sims = similarities[candidate_indices]
            k = min(top_k, len(candidate_indices))
            if k >= len(candidate_indices):
                sub_top = np.argsort(-sub_sims)
            else:
                partition_idx = np.argpartition(sub_sims, -k)[-k:]
                sub_top = partition_idx[np.argsort(-sub_sims[partition_idx])]

            top_indices = candidate_indices[sub_top]
        else:
            # Fast unfiltered path
            k = min(top_k, num_docs)
            if k <= 0:
                return []
            if k >= num_docs:
                top_indices = np.argsort(-similarities)
            else:
                partition_idx = np.argpartition(similarities, -k)[-k:]
                top_indices = partition_idx[np.argsort(-similarities[partition_idx])]

        # 5. Build results
        recommendations: List[PaperRecommendation] = []
        for idx in top_indices:
            score = float(similarities[idx])
            meta = self.paper_metadata[idx]

            recommendations.append(
                PaperRecommendation(
                    id=str(meta["id"]),
                    title=str(meta["title"]),
                    summary=str(meta["summary"]),
                    category=str(meta.get("category", "")),
                    category_code=str(meta.get("category_code", "")),
                    authors=str(meta.get("authors", "")),
                    first_author=str(meta.get("first_author", "")),
                    published_date=str(meta.get("published_date", "")),
                    similarity_score=round(score, 4),
                )
            )

        return recommendations


# Dependency provider
_matcher_instance: Optional[PaperMatcher] = None


def get_matcher() -> PaperMatcher:
    """FastAPI dependency to provide a shared PaperMatcher instance."""
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = PaperMatcher()
    return _matcher_instance
