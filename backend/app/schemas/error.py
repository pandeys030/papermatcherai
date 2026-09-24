"""API error response schemas."""

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Specific field or parameter validation error detail."""

    field: Optional[str] = Field(default=None, description="Field name with error")
    message: str = Field(..., description="Description of the error")


class ErrorResponse(BaseModel):
    """Uniform error response structure."""

    error: str = Field(..., description="High-level error classification code")
    message: str = Field(..., description="Human-readable explanation of error")
    status_code: int = Field(..., description="HTTP status code")


class ValidationErrorResponse(ErrorResponse):
    """Validation failure response schema."""

    details: List[Any] = Field(
        default_factory=list,
        description="Detailed list of field validation errors",
    )
