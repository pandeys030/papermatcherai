# PaperMatcher-AI: Intelligent Scientific Paper Recommendation System

> **A Final Year B.Tech Computer Science & Engineering Capstone Project**  
> *Deterministic Semantic Literature Discovery using Sparse Sublinear TF-IDF Vectorization, Exact Cosine Similarity, and Dynamic Pre-Ranking Categorical Filters across 287,421 arXiv Preprints.*

---

## 1. Project Overview

With hundreds of thousands of scientific preprints submitted annually to digital repositories like arXiv, researchers face severe information overload. Conventional search engines rely on exact keyword matches or boolean queries, which suffer from:
1. **Vocabulary Mismatch & Synonymy**: Different researchers describe equivalent concepts using distinct vocabularies (e.g., *“sublinear vectorization”* vs. *“term frequency scaling”*).
2. **Polysemy**: Homonymous terms yield irrelevant search noise across scientific disciplines.
3. **Generative Hallucination**: Generative AI search assistants frequently hallucinate non-existent paper titles, author attributions, and citations.

**PaperMatcher-AI** is a deterministic, high-throughput research paper recommendation system engineered to solve these challenges. Given a natural-language research thesis, hypothesis, query, or summary, PaperMatcher-AI projects the query into a high-dimensional scientific feature space, evaluates exact angular cosine distances across **287,421 precomputed arXiv preprints**, applies pre-ranking categorical and chronological constraints, and surfaces verified literature in under **25 milliseconds**.

---

## 2. System Architecture

PaperMatcher-AI is designed with a decoupled, high-performance client-server architecture:

```
                                  [ User Interface ]
                       React 18 + Vite + Tailwind CSS (Port 5173)
                   (Editorial Research Journal & Stationery Folio UI)
                                         │
                                         ▼ HTTP REST (JSON)
                            [ FastAPI Backend Service ]
                            Uvicorn ASGI (Port 8002)
                                         │
                ┌────────────────────────┴────────────────────────┐
                ▼                                                 ▼
     [ GET /api/v1/health ]                       [ POST /api/v1/recommendations ]
     [ GET /api/v1/recommendations/filters ]      (query, top_k, category, year)
                                                                  │
                                                                  ▼
                                                      [ Query Normalization ]
                                                      Text Preprocessing Pipeline
                                                                  │
                                                                  ▼
                                                      [ Sparse Vectorization ]
                                                      Pre-fitted TfidfVectorizer
                                                      (50k n-grams, sublinear TF)
                                                                  │
                                                                  ▼
                                                      [ Sparse Dot Product ]
                                                      Cosine Similarity Matrix
                                                      S(q, d) = v_q · v_d
                                                                  │
                                                                  ▼
                                                      [ Pre-Ranking Filters ]
                                                      Boolean Masking:
                                                      category_code & published_year
                                                                  │
                                                                  ▼
                                                      [ Top-K Index Selection ]
                                                      np.argpartition & Sort
                                                                  │
                                                                  ▼
                                                      [ Metadata Hydration ]
                                                      Ground-Truth arXiv Record
                                                                  │
                                                                  ▼
                                                      [ 200 OK JSON Response ]
```

---

## 3. Dataset Pipeline & Corpus Characteristics

### 3.1 Corpus Specifications
The underlying corpus is derived from a real-world arXiv scientific preprint dataset containing comprehensive multi-disciplinary computer science, statistics, mathematics, and electrical engineering records:
- **Total Ingested Preprints**: 287,421 documents
- **Valid Filtered Corpus**: 287,383 verified documents
- **Dataset Size**: ~410 MB raw CSV
- **Subject Categories**: 147 distinct arXiv classifications (e.g., `cs.LG`, `cs.CV`, `cs.CL`, `cs.AI`, `cs.CR`, `stat.ML`)
- **Publication Epoch**: 1993 through 2026

### 3.2 Dataset Schema
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `str` | Unique arXiv preprint identifier (e.g. `abs-1910.03771v5`, `2406.12221`) |
| `title` | `str` | Complete title of the research publication |
| `summary` | `str` | Complete author-provided research summary (*Note: strictly "summary", never "abstract"*) |
| `category` | `str` | Full taxonomy classification name (e.g. `Computation and Language`) |
| `category_code` | `str` | Primary arXiv subject code (e.g. `cs.CL`, `cs.LG`, `cs.AI`) |
| `published_date` | `str` | Original submission timestamp (formatted as `M/D/YY`) |
| `updated_date` | `str` | Date of the latest revision |
| `authors` | `str` | Complete co-author listing |
| `first_author` | `str` | Primary investigator / lead author |
| `summary_word_count`| `int` | Length of summary in words |

### 3.3 Data Hygiene & Normalization
Implemented in `backend/app/services/dataset.py`:
1. **Deduplication**: Resolves duplicate arXiv IDs and removes duplicate normalized `(title, summary)` pairs (38 identical preprints identified and pruned).
2. **Missing Field Imputation**: Ensures all document vectors have non-null titles and summaries. Empty documents are systematically rejected.
3. **Dynamic Path Resolution**: Configurable relative resolution (`data/arXiv_scientific_dataset.csv`) without hardcoded absolute operating system paths.

---

## 4. NLP Methodology & Mathematical Formulation

### 4.1 Document Representation
Each paper document $d$ is constructed by concatenating its title and summary:
$$\text{text}(d) = \text{title}(d) \mathbin{\Vert} \text{summary}(d)$$
This provides strong thematic context from the title amplified by the dense scientific specifics in the summary.

### 4.2 Sublinear TF-IDF Formulation
Term Frequency-Inverse Document Frequency (TF-IDF) converts textual documents into numerical vectors. To prevent long research summaries from disproportionately penalizing concise papers, **Sublinear Term Frequency** scaling is applied:

$$\text{tf}(t, d) = \begin{cases} 1 + \log(\text{count}(t, d)) & \text{if } \text{count}(t, d) > 0 \\ 0 & \text{otherwise} \end{cases}$$

$$\text{idf}(t) = \log\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$

$$\mathbf{w}_{d, t} = \text{tf}(t, d) \times \text{idf}(t)$$

$$\mathbf{v}_d = \frac{\mathbf{w}_d}{\|\mathbf{w}_d\|_2} = \frac{\mathbf{w}_d}{\sqrt{\sum_{t} \mathbf{w}_{d, t}^2}}$$

### 4.3 Hyperparameter Justification
| Parameter | Value | Scientific Rationale |
| :--- | :--- | :--- |
| `max_features` | `50,000` | Captures an extensive vocabulary of specialized academic terms while bounding memory footprint to ~181 MB. |
| `ngram_range` | `(1, 2)` | Preserves essential scientific bigrams (e.g., *"graph neural"*, *"diffusion models"*, *"attention mechanism"*, *"federated learning"*). |
| `min_df` | `5` | Suppresses idiosyncratic typos and OCR errors appearing in fewer than 5 papers. |
| `max_df` | `0.80` | Filters ubiquitous corpus-wide boilerplate appearing in >80% of papers without manual stopword lists. |
| `sublinear_tf` | `True` | Dampens repeated keyword spamming; a term appearing 10 times is not 10 times more salient than one appearing once. |
| `norm` | `'l2'` | Normalizes every vector to unit Euclidean length so inner product equals cosine similarity. |

### 4.4 Cosine Similarity Vector Geometry
Since all document vectors $\mathbf{v}_d$ and the transformed query vector $\mathbf{v}_q$ are unit L2-normalized ($\|\mathbf{v}_q\|_2 = \|\mathbf{v}_d\|_2 = 1$), the cosine similarity simplifies to an exact matrix-vector dot product:

$$\text{Sim}(\mathbf{q}, \mathbf{d}) = \cos\theta = \frac{\mathbf{v}_q \cdot \mathbf{v}_d}{\|\mathbf{v}_q\|_2 \|\mathbf{v}_d\|_2} = \sum_{j=1}^{M} v_{q, j} \cdot v_{d, j} = \mathbf{A} \mathbf{v}_q^T$$

where $\mathbf{A} \in \mathbb{R}^{287,383 \times 50,000}$ is the precomputed sparse document matrix.

### 4.5 Memory & Complexity Optimization
- **Dense Matrix Pitfall Avoidance**: A dense $287,383 \times 50,000$ 64-bit float matrix requires $\approx 115\text{ GB}$ of RAM, making deployment on typical machines impossible.
- **Compressed Sparse Row (CSR)**: By utilizing `scipy.sparse.csr_matrix`, only non-zero coordinates are stored in memory. The entire 287k dataset matrix compiles to just **181.3 MB** in `models/tfidf_matrix.npz`.
- **Latency**: Query transformation and matrix-vector multiplication execute in **< 25 ms** on commodity CPU hardware.

---

## 5. Technology Stack

- **Core Backend Framework**: Python 3.10+, FastAPI, Uvicorn (ASGI)
- **Data Validation & Schemas**: Pydantic v2, Pydantic-Settings
- **Machine Learning & NLP**: scikit-learn (`TfidfVectorizer`), NumPy, SciPy (Sparse CSR matrices), Joblib
- **Data Ingestion & Wrangling**: Pandas
- **Frontend Framework**: React 18, Vite 5, JavaScript (ES Modules)
- **Styling Architecture**: Vanilla CSS, Tailwind CSS (Custom stationery palette: `#F7FBFD`, `#FFFFFF`, `#9DDCF5`, `#183B56`, `#667786`, `#DDE9EF`)
- **Typography**: Google Fonts (`DM Serif Display` for academic headings, `DM Sans` for body, `DM Mono` for metadata)

---

## 6. Project Directory Structure

```
PaperMatcher-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── health.py             # Health probe endpoint
│   │   │       │   └── recommendations.py    # Recommendation & filter endpoints
│   │   │       └── router.py                 # API v1 route aggregator
│   │   ├── core/
│   │   │   ├── config.py                     # App configuration, paths, & CORS
│   │   │   └── exceptions.py                 # Custom exceptions & handlers
│   │   ├── schemas/
│   │   │   ├── health.py                     # Health response Pydantic models
│   │   │   └── recommendation.py             # Request, filter, & paper models
│   │   ├── services/
│   │   │   ├── build_index.py                # Standalone script to compile TF-IDF artifacts
│   │   │   ├── dataset.py                    # Dataset loading, cleaning, deduplication
│   │   │   └── matcher.py                    # Precomputed TF-IDF index matcher service
│   │   ├── __init__.py
│   │   └── main.py                           # FastAPI application entrypoint & lifespan
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── FilterBar.jsx                 # Editorial category/year/top-k controls
│   │   │   ├── Methodology.jsx               # 4-stage retrieval mathematical formulation
│   │   │   ├── Navbar.jsx                    # Editorial navigation & stationery mark
│   │   │   ├── PaperDetailModal.jsx          # Digital academic paper folio modal
│   │   │   ├── PaperStack.jsx                # Physical tactile paper stack with brass clip
│   │   │   └── ResearchPreview.jsx           # Monograph results list with cosine metrics
│   │   ├── services/
│   │   │   └── api.js                        # Axios/Fetch API client bindings
│   │   ├── App.jsx                           # Main layout & state orchestrator
│   │   ├── index.css                         # Stationery background, highlighter styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── data/
│   └── arXiv_scientific_dataset.csv          # Ingested 287k arXiv dataset
├── models/
│   ├── tfidf_vectorizer.joblib               # Fitted TfidfVectorizer (625 KB)
│   ├── tfidf_matrix.npz                      # Sparse document matrix (181.3 MB)
│   └── paper_metadata.joblib                 # Pre-extracted metadata dictionary (156 MB)
├── scratch/
│   └── verify_production_readiness.py        # Automated test suite for production verification
└── README.md
```

---

## 7. Installation & Setup Guide

### 7.1 Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12
- **Node.js**: Version 18.0+ and npm 9.0+
- **Memory**: Minimum 4 GB RAM (8 GB recommended)

### 7.2 Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

5. **Generate the Precomputed TF-IDF Index (One-Time Setup)**:
   *If the artifacts in `models/` do not already exist, compile them from the raw dataset:*
   ```bash
   python -m app.services.build_index
   ```
   This fits the 50k-feature vectorizer once on the 287,383 valid papers and persists `tfidf_vectorizer.joblib`, `tfidf_matrix.npz`, and `paper_metadata.joblib`.

6. **Launch the FastAPI Server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8002
   ```
   The backend will start and preload the index in ~5 seconds.
   - Interactive Swagger API Documentation: `http://127.0.0.1:8002/docs`
   - Alternative ReDoc Documentation: `http://127.0.0.1:8002/redoc`

---

### 7.3 Frontend Setup

1. **Open a separate terminal and navigate to `frontend/`**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   Open your browser at `http://127.0.0.1:5173/`.

---

## 8. API Endpoints Reference

### 8.1 Health Check
- **Endpoint**: `GET /api/v1/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "PaperMatcher-AI"
  }
  ```

### 8.2 Dynamic Filter Metadata
- **Endpoint**: `GET /api/v1/recommendations/filters`
- **Description**: Returns all distinct categories (with counts) and publication years aggregated from the 287k corpus.
- **Response**:
  ```json
  {
    "categories": [
      {
        "code": "cs.LG",
        "name": "Machine Learning",
        "count": 80439
      },
      {
        "code": "cs.CV",
        "name": "Computer Vision and Pattern Recognition",
        "count": 71101
      },
      {
        "code": "cs.CL",
        "name": "Computation and Language (NLP)",
        "count": 37249
      }
    ],
    "years": [2026, 2025, 2024, 2023, 2022, 2021, 2020, "..."]
  }
  ```

### 8.3 Semantic Recommendations
- **Endpoint**: `POST /api/v1/recommendations`
- **Request Body**:
  ```json
  {
    "query": "transformer architectures for natural language processing",
    "top_k": 5,
    "category_code": "cs.CL",
    "published_year": 2024
  }
  ```
- **Response**:
  ```json
  {
    "query": "transformer architectures for natural language processing",
    "total_results": 5,
    "results": [
      {
        "id": "2407.09871",
        "title": "Investigating Low-Rank Training in Transformer Language Models",
        "summary": "We study parameter-efficient low-rank adaptation across diverse transformer architectures...",
        "category": "Computation and Language",
        "category_code": "cs.CL",
        "authors": "Jane Doe, John Smith",
        "first_author": "Jane Doe",
        "published_date": "7/13/24",
        "similarity_score": 0.2543
      }
    ]
  }
  ```

---

## 9. Benchmark Verification & Experimental Results

PaperMatcher-AI was validated against 7 complex scientific queries across computer science disciplines. 100% of surfaced preprints were verified against the ground-truth metadata:

| Query | Top-Ranked Surfaced Paper | Category | Cosine Score | Verified in Corpus |
| :--- | :--- | :---: | :---: | :---: |
| **"transformer architectures for natural language processing"** | *HuggingFace's Transformers: State-of-the-art Natural Language Processing* | `cs.CL` | `0.3662` | **Yes (100%)** |
| **"large language models hallucination"** | *Knowledge Overshadowing Causes Amalgamated Hallucination in Large Language Models* | `cs.CL` | `0.3147` | **Yes (100%)** |
| **"diffusion models image generation"** | *Ultrasound Image Generation using Latent Diffusion Models* | `cs.CV` | `0.3209` | **Yes (100%)** |
| **"graph neural networks"** | *Graph Neural Networks: Taxonomy, Advances and Trends* | `cs.LG` | `0.4192` | **Yes (100%)** |
| **"reinforcement learning from human feedback"** | *Off-Policy Evaluation from Logged Human Feedback* | `cs.LG` | `0.3984` | **Yes (100%)** |
| **"federated learning privacy"** | *Towards Privacy-Preserving Data-Driven Education: Potential of Federated Learning* | `cs.LG` | `0.4060` | **Yes (100%)** |
| **"computer vision image classification"** | *A Review of Pulse-Coupled Neural Network Applications in Computer Vision* | `cs.CV` | `0.2703` | **Yes (100%)** |

---

## 10. Automated Production Readiness Test Suite

To run the complete automated production verification suite:

```bash
python scratch/verify_production_readiness.py
```

**Verification Checklist**:
- [x] FastAPI server listening and operational on port `8002` (configurable in `.env`).
- [x] Health check endpoint `GET /api/v1/health` returns status `200 OK`.
- [x] Dynamic filter endpoint `GET /api/v1/recommendations/filters` returns 147 categories and 34 years.
- [x] CORS headers correctly validate for `http://localhost:5173`, `http://localhost:5174`, and `http://127.0.0.1:5173`.
- [x] Precomputed sparse TF-IDF CSR matrix loaded without dense memory conversion.
- [x] 100% of returned recommendation results match verified ground-truth dataset records.
- [x] Similarity scores are strictly bounded in $[0.0, 1.0]$ and monotonically descending.
- [x] Frontend builds with zero JSX or CSS compilation errors (`npm run build`).
- [x] No fake papers, no fake similarity scores, no hardcoded absolute OS paths, no exposed secrets.

---

## 11. Authors & Academic Acknowledgments

Developed as a Final Year B.Tech Computer Science & Engineering Capstone Project.  
Dataset provided courtesy of the arXiv open-access preprint repository.
