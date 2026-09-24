# Models Directory

This directory is designated for storing serialized model artifacts and precomputed indexes for PaperMatcher-AI.

## Overview
As the NLP matching engine is built, artifacts such as:
- Fitted TF-IDF Vectorizer models (`.pkl` / `.joblib`)
- Precomputed document-term matrices / representations
- Vocabulary indices

will be persisted in this directory for fast loading during runtime.

## Directory Policy
- Generated binary and model files are ignored by git via `.gitignore`.
- Keep documentation of training parameters and model versioning here or alongside training pipelines.
