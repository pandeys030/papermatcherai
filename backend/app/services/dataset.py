"""Dataset Service.

Responsible for ingesting, validating, normalizing, and deduplicating
the arXiv research paper dataset.
"""

import os
import re
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional
import pandas as pd

from app.core.config import settings

logger = logging.getLogger("papermatcher.dataset")


@dataclass
class DatasetStats:
    """Metrics and profiling statistics for loaded dataset."""

    total_rows: int = 0
    valid_documents: int = 0
    duplicate_ids: int = 0
    duplicate_titles: int = 0
    duplicate_title_summary: int = 0
    missing_titles: int = 0
    missing_summaries: int = 0
    empty_documents: int = 0
    file_size_bytes: int = 0
    columns: List[str] = field(default_factory=list)


class DatasetLoader:
    """Service to load, clean, validate, and preprocess the arXiv paper dataset."""

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path
        self.df: Optional[pd.DataFrame] = None
        self.stats: Optional[DatasetStats] = None

    def resolve_dataset_path(self) -> Path:
        """Resolve configurable dataset path without hardcoded absolute paths."""
        if self.data_path:
            p = Path(self.data_path)
            if p.is_absolute() and p.exists():
                return p
            if p.exists():
                return p.resolve()
            # Check relative to project root
            project_root = Path(__file__).resolve().parent.parent.parent.parent
            if (project_root / p).exists():
                return (project_root / p).resolve()
            return p.resolve()

        return settings.get_dataset_file_path()

    def preprocess_text(self, text: str) -> str:
        """Clean and normalize text while preserving technical terminology.

        Preserves terms like Transformer, BERT, RAG, LLM, CNN, GNN,
        reinforcement learning, federated learning, computer vision.
        Collapses extraneous whitespace (newlines, tabs, multiple spaces).
        """
        if not isinstance(text, str) or not text:
            return ""

        # Normalize line endings and whitespace to single space
        cleaned = re.sub(r"\s+", " ", text).strip()
        return cleaned

    def load_dataset(self) -> pd.DataFrame:
        """Load, validate, clean, and deduplicate research paper dataset.

        Calculates dataset metrics and prepares 'document_text' (title + ' ' + summary)
        for semantic retrieval.
        """
        dataset_path = self.resolve_dataset_path()

        if not dataset_path.exists():
            error_msg = f"Dataset file not found at path: {dataset_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)

        file_size = os.path.getsize(dataset_path)
        logger.info(
            "Loading arXiv dataset from %s (%.2f MB)...",
            dataset_path,
            file_size / (1024 * 1024),
        )

        # Read CSV dataset
        raw_df = pd.read_csv(dataset_path)
        total_rows = len(raw_df)
        columns = list(raw_df.columns)

        # Clean text columns: title and summary
        clean_titles = (
            raw_df["title"]
            .fillna("")
            .astype(str)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )
        clean_summaries = (
            raw_df["summary"]
            .fillna("")
            .astype(str)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
        )

        # Missing values & empty documents detection
        missing_titles = int((clean_titles == "").sum())
        missing_summaries = int((clean_summaries == "").sum())

        # Construct retrieval document text (title + " " + summary)
        # Authors, dates, category remain metadata and are NOT in document_text
        document_text = clean_titles + " " + clean_summaries
        empty_documents = int((document_text.str.strip() == "").sum())

        # Duplicates detection
        dup_ids = int(raw_df["id"].duplicated(keep="first").sum())
        dup_titles = int(clean_titles.str.lower().duplicated(keep="first").sum())

        # Normalized content for duplicate paper detection (lowercased title + summary)
        norm_content = clean_titles.str.lower() + " " + clean_summaries.str.lower()
        dup_title_summary = int(norm_content.duplicated(keep="first").sum())

        # Filter valid and deduplicated records:
        # 1. Non-empty title and summary
        # 2. Non-empty document text
        # 3. Unique IDs (keep first)
        # 4. Unique normalized content (keep first)
        valid_mask = (
            (clean_titles != "")
            & (clean_summaries != "")
            & (document_text.str.strip() != "")
            & (~raw_df["id"].duplicated(keep="first"))
            & (~norm_content.duplicated(keep="first"))
        )

        valid_df = raw_df[valid_mask].copy()
        valid_df["title"] = clean_titles[valid_mask]
        valid_df["summary"] = clean_summaries[valid_mask]
        valid_df["document_text"] = document_text[valid_mask]
        valid_documents = len(valid_df)

        # Store stats
        self.stats = DatasetStats(
            total_rows=total_rows,
            valid_documents=valid_documents,
            duplicate_ids=dup_ids,
            duplicate_titles=dup_titles,
            duplicate_title_summary=dup_title_summary,
            missing_titles=missing_titles,
            missing_summaries=missing_summaries,
            empty_documents=empty_documents,
            file_size_bytes=file_size,
            columns=columns,
        )

        self.df = valid_df

        # Required logs
        logger.info("Dataset loaded: %d", self.stats.total_rows)
        logger.info("Valid documents: %d", self.stats.valid_documents)
        logger.info("Duplicate IDs: %d", self.stats.duplicate_ids)
        logger.info("Empty documents: %d", self.stats.empty_documents)
        logger.info("Duplicate normalized titles: %d", self.stats.duplicate_titles)
        logger.info("Duplicate normalized title + summary: %d", self.stats.duplicate_title_summary)
        logger.info("Missing titles: %d", self.stats.missing_titles)
        logger.info("Missing summaries: %d", self.stats.missing_summaries)

        # Also output clear startup summary
        print(f"Dataset loaded: {self.stats.total_rows}")
        print(f"Valid documents: {self.stats.valid_documents}")
        print(f"Duplicate IDs: {self.stats.duplicate_ids}")
        print(f"Empty documents: {self.stats.empty_documents}")

        return self.df

    def get_stats(self) -> Optional[DatasetStats]:
        """Return dataset statistics if loaded."""
        return self.stats


# Dependency provider
_dataset_loader_instance: Optional[DatasetLoader] = None


def get_dataset_loader() -> DatasetLoader:
    """FastAPI dependency providing shared DatasetLoader instance."""
    global _dataset_loader_instance
    if _dataset_loader_instance is None:
        _dataset_loader_instance = DatasetLoader()
    return _dataset_loader_instance
