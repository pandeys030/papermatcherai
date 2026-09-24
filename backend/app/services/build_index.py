"""Indexing pipeline to fit and persist TF-IDF vectorizer, sparse matrix, and metadata.

Produces:
- models/tfidf_vectorizer.joblib
- models/tfidf_matrix.npz
- models/paper_metadata.joblib
"""

import os
import sys
import time
import logging
from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer

# Ensure backend is on sys.path if run directly
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent.parent
project_root = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.dataset import DatasetLoader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("papermatcher.indexer")


def get_models_dir() -> Path:
    """Return absolute path to models directory."""
    models_dir = project_root / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    return models_dir


def build_index() -> Dict[str, Any]:
    """Build and persist TF-IDF vectorizer, sparse document matrix, and paper metadata.

    Returns:
        Dict containing performance metrics, vocabulary size, and matrix dimensions.
    """
    logger.info("=== Starting PaperMatcher-AI Index Build ===")
    start_total_time = time.time()

    # 1. Load cleaned and deduplicated dataset
    loader = DatasetLoader()
    df = loader.load_dataset()
    logger.info("Dataset ready with %d valid documents.", len(df))

    # 2. Configure TfidfVectorizer
    # Rationale:
    # - ngram_range=(1, 2): Captures unigrams and compound terminology (e.g. "diffusion models", "graph neural").
    # - max_features=50000: Binds sparse vocabulary to top 50k informative tokens for optimal memory footprint.
    # - min_df=5: Removes rare noise and spelling outliers appearing in fewer than 5 papers.
    # - max_df=0.85: Removes common boilerplate appearing in >85% of documents.
    # - sublinear_tf=True: Dampens frequency scaling via 1 + log(tf) to avoid term over-weighting in long summaries.
    # - stop_words='english': Strips standard English stopwords.
    # - dtype=np.float32: 32-bit floats saving 50% memory over float64.
    # - norm='l2': Enables exact cosine similarity computation via vector dot product.
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=50000,
        min_df=5,
        max_df=0.85,
        sublinear_tf=True,
        stop_words="english",
        dtype=np.float32,
        norm="l2",
    )

    # 3. Fit and transform
    logger.info("Fitting TfidfVectorizer and transforming document_text...")
    fit_start = time.time()
    paper_matrix = vectorizer.fit_transform(df["document_text"])
    fit_time = time.time() - fit_start

    vocab_size = len(vectorizer.vocabulary_)
    matrix_shape = paper_matrix.shape
    nnz = paper_matrix.nnz
    matrix_memory_mb = (paper_matrix.data.nbytes + paper_matrix.indices.nbytes + paper_matrix.indptr.nbytes) / (1024 * 1024)

    logger.info("TF-IDF Fit & Transform completed in %.2f seconds.", fit_time)
    logger.info("Vocabulary size: %d terms", vocab_size)
    logger.info("Matrix shape: %s (non-zero elements: %d)", matrix_shape, nnz)
    logger.info("Matrix RAM usage: %.2f MB", matrix_memory_mb)

    # 4. Prepare metadata mapping
    logger.info("Preparing metadata mapping...")
    metadata_cols = [
        "id",
        "title",
        "summary",
        "category",
        "category_code",
        "authors",
        "first_author",
        "published_date",
    ]
    paper_metadata = df[metadata_cols].to_dict(orient="records")

    # 5. Persist artifacts
    models_dir = get_models_dir()
    vectorizer_path = models_dir / "tfidf_vectorizer.joblib"
    matrix_path = models_dir / "tfidf_matrix.npz"
    metadata_path = models_dir / "paper_metadata.joblib"

    logger.info("Saving fitted vectorizer to %s...", vectorizer_path)
    joblib.dump(vectorizer, vectorizer_path, compress=3)

    logger.info("Saving sparse CSR matrix to %s...", matrix_path)
    sp.save_npz(matrix_path, paper_matrix)

    logger.info("Saving paper metadata to %s...", metadata_path)
    joblib.dump(paper_metadata, metadata_path, compress=3)

    total_time = time.time() - start_total_time

    # Calculate file sizes
    vectorizer_size_mb = os.path.getsize(vectorizer_path) / (1024 * 1024)
    matrix_size_mb = os.path.getsize(matrix_path) / (1024 * 1024)
    metadata_size_mb = os.path.getsize(metadata_path) / (1024 * 1024)

    logger.info("=== Index Build Complete ===")
    logger.info("Total build time: %.2f seconds", total_time)
    logger.info("Vectorizer file size: %.2f MB", vectorizer_size_mb)
    logger.info("Matrix file size: %.2f MB", matrix_size_mb)
    logger.info("Metadata file size: %.2f MB", metadata_size_mb)

    return {
        "build_time_seconds": total_time,
        "fit_time_seconds": fit_time,
        "vocabulary_size": vocab_size,
        "matrix_shape": matrix_shape,
        "matrix_nnz": nnz,
        "matrix_memory_mb": matrix_memory_mb,
        "vectorizer_file_size_mb": vectorizer_size_mb,
        "matrix_file_size_mb": matrix_size_mb,
        "metadata_file_size_mb": metadata_size_mb,
    }


if __name__ == "__main__":
    build_index()
