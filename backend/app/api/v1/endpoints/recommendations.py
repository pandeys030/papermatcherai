"""Recommendation HTTP endpoints."""

from fastapi import APIRouter, Depends, status
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.schemas.error import ErrorResponse, ValidationErrorResponse
from app.services.matcher import PaperMatcher, get_matcher

router = APIRouter()


@router.get(
    "/filters",
    status_code=status.HTTP_200_OK,
    summary="Get Dynamic Filter Options",
    description="Returns available categories and publication years dynamically populated from the dataset.",
    responses={
        status.HTTP_200_OK: {
            "description": "Available category codes and publication years.",
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": ErrorResponse,
            "description": "Recommendation engine or index is not yet initialized.",
        },
    },
)
async def get_filter_options(
    matcher: PaperMatcher = Depends(get_matcher),
):
    """Retrieve dynamic filter metadata for categories and years directly from dataset."""
    return matcher.get_filter_options()


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Paper Recommendations",
    description=(
        "Find research papers semantically related to a user's research idea, topic, or query. "
        "Supports optional filtering by category_code (e.g. 'cs.CL') and published_year (e.g. 2024). "
        "Returns HTTP 503 if the NLP engine and dataset have not yet been initialized."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": RecommendationResponse,
            "description": "Successfully generated recommendations.",
        },
        422: {
            "model": ValidationErrorResponse,
            "description": "Validation error in request parameters (e.g. invalid top_k, invalid year, or query length).",
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": ErrorResponse,
            "description": "Recommendation engine is not yet initialized.",
        },
    },
)
@router.post(
    "/",
    response_model=RecommendationResponse,
    include_in_schema=False,
)
async def generate_recommendations(
    request: RecommendationRequest,
    matcher: PaperMatcher = Depends(get_matcher),
) -> RecommendationResponse:
    """Handle recommendation request by delegating to the PaperMatcher service."""
    recommendations = matcher.recommend(
        query=request.query,
        top_k=request.top_k,
        category_code=request.category_code,
        published_year=request.published_year,
    )

    return RecommendationResponse(
        query=request.query,
        total_results=len(recommendations),
        results=recommendations,
    )
