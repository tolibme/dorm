from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import models  # noqa: F401 — register models with Base metadata
from routers import (
    staff, students, dormitories, rooms, applications,
    assignments, payments, maintenance, reports, auth,
)
from routers.auth import limiter

app = FastAPI(
    title="University Dormitory Management System",
    description="REST API for managing university dormitories — rooms, students, applications, payments, and maintenance.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(staff.router)
app.include_router(students.router)
app.include_router(dormitories.router)
app.include_router(rooms.router)
app.include_router(applications.router)
app.include_router(assignments.router)
app.include_router(payments.router)
app.include_router(maintenance.router)
app.include_router(reports.router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "Dorm Management API", "docs": "/docs"}
