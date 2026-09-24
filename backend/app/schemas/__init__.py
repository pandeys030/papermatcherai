"""Pydantic schemas for PaperMatcher-AI API."""

from app.schemas.health import HealthResponse
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    PaperRecommendation,
)
from app.schemas.error import ErrorResponse, ValidationErrorResponse

__all__ = [
    "HealthResponse",
    "RecommendationRequest",
    "RecommendationResponse",
    "PaperRecommendation",
    "ErrorResponse",
    "ValidationErrorResponse",
]
