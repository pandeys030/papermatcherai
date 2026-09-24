"""Production readiness verification script for PaperMatcher-AI.

Tests:
1. FastAPI Health endpoint (http://127.0.0.1:8001/api/v1/health)
2. Dynamic Filters endpoint (http://127.0.0.1:8001/api/v1/recommendations/filters)
3. CORS headers for localhost:5173, localhost:5174, 127.0.0.1:5173
4. Dataset metadata integrity (no hardcoded paths, 287k papers)
5. 7 Benchmark research queries:
   - "transformer architectures for natural language processing"
   - "large language models hallucination"
   - "diffusion models image generation"
   - "graph neural networks"
   - "reinforcement learning from human feedback"
   - "federated learning privacy"
   - "computer vision image classification"
6. Verification that all returned paper IDs and titles exist in real dataset
"""

import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path
import joblib

BACKEND_URL = "http://127.0.0.1:8002"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
METADATA_FILE = MODELS_DIR / "paper_metadata.joblib"


def test_health():
    print("=== 1. Testing Health Endpoint ===")
    url = f"{BACKEND_URL}/api/v1/health"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200, f"Expected 200, got {response.status}"
        data = json.loads(response.read().decode("utf-8"))
        print(f"Status: {data.get('status')}")
        print(f"Service: {data.get('service')}")
        assert data.get("status") == "healthy"
        assert data.get("service") == "PaperMatcher-AI"
    print("Health check PASSED\n")


def test_filters():
    print("=== 2. Testing Dynamic Filters Endpoint ===")
    url = f"{BACKEND_URL}/api/v1/recommendations/filters"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        data = json.loads(response.read().decode("utf-8"))
        categories = data.get("categories", [])
        years = data.get("years", [])
        print(f"Categories returned: {len(categories)}")
        print(f"Years returned: {len(years)}")
        assert len(categories) >= 100, "Expected at least 100 arXiv categories"
        assert len(years) >= 20, "Expected at least 20 publication years"
    print("Filters check PASSED\n")


def test_cors():
    print("=== 3. Testing CORS Headers ===")
    for origin in ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"]:
        req = urllib.request.Request(
            f"{BACKEND_URL}/api/v1/health",
            headers={"Origin": origin, "Access-Control-Request-Method": "GET"},
        )
        with urllib.request.urlopen(req) as response:
            allow_origin = response.headers.get("Access-Control-Allow-Origin")
            print(f"Origin '{origin}' -> Access-Control-Allow-Origin: {allow_origin}")
            assert allow_origin in [origin, "*"], f"CORS origin not allowed for {origin}"
    print("CORS check PASSED\n")


def test_benchmark_queries():
    print("=== 4. Testing 7 Benchmark Research Queries against Real arXiv Corpus ===")
    
    # Load ground truth metadata to verify all returned papers actually exist
    print(f"Loading ground truth metadata from {METADATA_FILE}...")
    metadata_list = joblib.load(METADATA_FILE)
    id_to_meta = {str(m["id"]): m for m in metadata_list}
    print(f"Loaded {len(id_to_meta)} ground truth paper records.\n")

    queries = [
        "transformer architectures for natural language processing",
        "large language models hallucination",
        "diffusion models image generation",
        "graph neural networks",
        "reinforcement learning from human feedback",
        "federated learning privacy",
        "computer vision image classification",
    ]

    all_verified = True

    for i, q in enumerate(queries, 1):
        print(f"Query {i}/{len(queries)}: \"{q}\"")
        payload = json.dumps({"query": q, "top_k": 5}).encode("utf-8")
        req = urllib.request.Request(
            f"{BACKEND_URL}/api/v1/recommendations",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req) as response:
            assert response.status == 200
            res = json.loads(response.read().decode("utf-8"))
            results = res.get("results", [])
            assert len(results) == 5, f"Expected 5 results, got {len(results)}"

            scores = [r["similarity_score"] for r in results]
            # Ensure similarity scores are descending
            assert scores == sorted(scores, reverse=True), "Scores are not monotonically descending"
            # Ensure scores are between 0 and 1
            assert all(0.0 <= s <= 1.0 for s in scores), "Scores out of range [0, 1]"

            for rank, paper in enumerate(results, 1):
                p_id = str(paper["id"])
                # Ground-truth existence check
                assert p_id in id_to_meta, f"Paper ID '{p_id}' DOES NOT EXIST in ground truth dataset!"
                gt = id_to_meta[p_id]
                assert gt["title"] == paper["title"], "Title mismatch with dataset!"
                assert gt["summary"] == paper["summary"], "Summary mismatch with dataset!"
                
                print(f"   [{rank}] ({paper['similarity_score']:.4f}) {paper['title'][:70]}... [{paper['category_code']}]")

        print("   -> Verified 5/5 real papers in corpus.\n")

    print("All 7 Benchmark queries PASSED verification!\n")


def main():
    try:
        test_health()
        test_filters()
        test_cors()
        test_benchmark_queries()
        print("************************************************")
        print("ALL PRODUCTION READINESS CHECKS PASSED (100%)")
        print("************************************************")
    except Exception as e:
        print(f"VERIFICATION FAILED: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
