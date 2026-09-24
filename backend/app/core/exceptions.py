"""Custom exceptions and global error handlers for PaperMatcher-AI."""

import logging
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("papermatcher.api")


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class EngineNotInitializedException(AppException):
    """Raised when recommendations are requested before the NLP engine is loaded."""

    def __init__(
        self,
        message: str = (
            "Recommendation engine is not initialized. Model and dataset must be loaded "
            "before generating recommendations."
        ),
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


async def engine_not_initialized_handler(
    request: Request,
    exc: EngineNotInitializedException,
) -> JSONResponse:
    """Handle uninitialized NLP engine attempts."""
    logger.warning("Service unavailable: %s (Path: %s)", exc.message, request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "EngineNotInitialized",
            "message": exc.message,
            "status_code": exc.status_code,
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Format Pydantic validation errors cleanly without raw internals."""
    logger.info("Validation error on %s: %s", request.url.path, exc.errors())
    formatted_errors = []
    for err in exc.errors():
        loc = " -> ".join(str(item) for item in err.get("loc", []) if item != "body")
        formatted_errors.append({
            "field": loc or "body",
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error"),
        })

    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "message": "Invalid request payload.",
            "details": formatted_errors,
            "status_code": 422,
        },
    )


async def starlette_http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """Standardize HTTP errors (e.g. 404, 405)."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "message": str(exc.detail),
            "status_code": exc.status_code,
        },
    )


async def global_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Catch-all handler ensuring internal stack traces are never leaked."""
    logger.exception("Unhandled server exception processing %s", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected server error occurred. Please try again later.",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )
