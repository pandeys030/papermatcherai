from fastapi import APIRouter
from app.api.v1.endpoints import health, recommendations

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
