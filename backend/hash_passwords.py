from database import SessionLocal
import models
from auth import hash_password

hashed = hash_password("password123")

db = SessionLocal()
try:
    s = db.query(models.Student).filter(models.Student.password_hash.is_(None)).update({"password_hash": hashed})
    t = db.query(models.Staff).filter(models.Staff.password_hash.is_(None)).update({"password_hash": hashed})
    db.commit()
    print(f"Done — set password for {s} students and {t} staff (password: password123)")
finally:
    db.close()
