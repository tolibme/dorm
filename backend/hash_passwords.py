"""
Run once after loading seed.sql to set password_hash = bcrypt("password123")
for all seeded students and staff.

Usage:
    python hash_passwords.py
"""
from database import SessionLocal
import models
from auth import hash_password

hashed = hash_password("password123")

db = SessionLocal()
try:
    db.query(models.Student).update({"password_hash": hashed})
    db.query(models.Staff).update({"password_hash": hashed})
    db.commit()
    students = db.query(models.Student).count()
    staff = db.query(models.Staff).count()
    print(f"Done — updated {students} students and {staff} staff with password: password123")
finally:
    db.close()
