"""YatriLounge — FastAPI Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import init_db
from app.routers import data_ingestion, predictions, recommendations, simulation, analysis

app = FastAPI(
    title="YatriLounge API",
    description="Intelligent Airport Lounge Peak-Hour Predictor",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(data_ingestion.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(simulation.router)
app.include_router(analysis.router)


@app.on_event("startup")
def on_startup():
    """Initialize database on startup."""
    init_db()


@app.get("/")
async def root():
    return {
        "name": "YatriLounge API",
        "version": "1.0.0",
        "description": "Intelligent Airport Lounge Peak-Hour Predictor",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
