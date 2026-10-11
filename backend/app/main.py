from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seeding import seed_database

# Routers
from app.routers import leads, opportunities, cloud_fit, activities, accounts, renewals, proposals, reports, settings as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data if needed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-Grade B2B Cloud Sales Intelligence & CRM API. Built for consultative cloud selling, transparent lead qualification, revenue forecasting, and account retention.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(leads.router)
app.include_router(opportunities.router)
app.include_router(cloud_fit.router)
app.include_router(activities.router)
app.include_router(accounts.router)
app.include_router(renewals.router)
app.include_router(proposals.router)
app.include_router(reports.router)
app.include_router(settings_router.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs_url": "/docs",
        "disclaimer": "CloudSales IQ is an independent educational portfolio project. All data is fictional."
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": settings.APP_NAME}
