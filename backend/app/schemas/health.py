"""Health check schemas."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Response schema for API health status."""

    status: str = Field(
        ...,
        description="Health status of the service",
        example="healthy",
    )
    service: str = Field(
        ...,
        description="Name of the service",
        example="PaperMatcher-AI",
    )
