"""Health check endpoint."""

from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check the operational status of the PaperMatcher-AI API.",
)
async def health_check() -> HealthResponse:
    """Return application health status."""
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
    )
