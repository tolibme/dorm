from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine, Base
from routers import staff, students, dormitories, rooms, applications, assignments, payments, maintenance, reports, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="University Dormitory Management System",
    description="REST API for managing university dormitories — rooms, students, applications, payments, and maintenance.",
    version="1.0.0",
)

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
