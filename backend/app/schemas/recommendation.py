"""Recommendation request and response schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    """Payload schema for generating research paper recommendations."""

    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Research paper title, summary, topic, or query to match",
        example="transformer based language models",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of top paper recommendations to return (1 to 20)",
        example=5,
    )
    category_code: Optional[str] = Field(
        default=None,
        description="Optional arXiv subject code filter (e.g. cs.CL, cs.AI, cs.CV)",
        example="cs.CL",
    )
    published_year: Optional[int] = Field(
        default=None,
        ge=1990,
        le=2030,
        description="Optional publication year filter (e.g. 2024)",
        example=2024,
    )

    @field_validator("query")
    @classmethod
    def validate_non_empty_query(cls, value: str) -> str:
        """Ensure the query is not just blank whitespace."""
        stripped = value.strip()
        if len(stripped) < 3:
            raise ValueError("Query must contain at least 3 non-whitespace characters.")
        return stripped


class PaperRecommendation(BaseModel):
    """Schema representing an individual recommended paper."""

    id: str = Field(..., description="Unique paper identifier (e.g. arXiv ID)")
    title: str = Field(..., description="Paper title")
    summary: str = Field(..., description="Paper summary")
    category: Optional[str] = Field(default=None, description="Research category name")
    category_code: Optional[str] = Field(default=None, description="arXiv category code (e.g. cs.AI, cs.CL)")
    authors: Optional[str] = Field(default=None, description="Author names representation")
    first_author: Optional[str] = Field(default=None, description="First/lead author")
    published_date: Optional[str] = Field(default=None, description="Paper publication date")
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")


class RecommendationResponse(BaseModel):
    """Response schema returned upon successful recommendation query."""

    query: str = Field(..., description="The query submitted by the user")
    total_results: int = Field(..., description="Count of retrieved papers")
    results: List[PaperRecommendation] = Field(
        default_factory=list,
        description="Ranked list of paper recommendations",
    )
