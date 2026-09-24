"""PaperMatcher-AI FastAPI Application.

Main entry point for the FastAPI backend, configuring middleware, CORS,
exception handlers, application lifespan, and API routing.
"""

import logging
import sys
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    EngineNotInitializedException,
    engine_not_initialized_handler,
    validation_exception_handler,
    starlette_http_exception_handler,
    global_exception_handler,
)
from app.services.dataset import get_dataset_loader
from app.services.matcher import get_matcher

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("papermatcher")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize dataset and NLP engine on startup."""
    logger.info("Starting PaperMatcher-AI service...")
    loader = get_dataset_loader()
    try:
        loader.load_dataset()
    except Exception:
        logger.exception("Failed to load dataset on startup:")
        raise

    matcher = get_matcher()
    if not matcher.load_index(auto_build=False):
        logger.warning(
            "TF-IDF index artifacts not found in models/. Run 'python -m app.services.build_index' to generate the index."
        )

    yield

    logger.info("Shutting down PaperMatcher-AI backend...")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Intelligent research paper recommendation system using NLP "
        "(TF-IDF & Cosine Similarity) over arXiv datasets."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(
    EngineNotInitializedException,
    engine_not_initialized_handler,
)
app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)
app.add_exception_handler(
    StarletteHTTPException,
    starlette_http_exception_handler,
)
app.add_exception_handler(
    Exception,
    global_exception_handler,
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", summary="Root status", include_in_schema=False)
async def root():
    """Root endpoint verifying API availability and providing docs links."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
    )
