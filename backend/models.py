from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, CheckConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=True)

    dormitories = relationship("Dormitory", back_populates="manager")
    reviewed_applications = relationship("Application", back_populates="reviewer")
    maintenance_assignments = relationship("MaintenanceRequest", back_populates="assigned_staff")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    phone = Column(String(20))
    national_id = Column(String(50), unique=True)
    date_of_birth = Column(Date)
    gender = Column(String(10))
    faculty = Column(String(200))
    year_of_study = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    password_hash = Column(String(255), nullable=True)

    __table_args__ = (
        CheckConstraint("gender IN ('male', 'female', 'other')", name="check_student_gender"),
    )

    applications = relationship("Application", back_populates="student")
    assignments = relationship("Assignment", back_populates="student")
    payments = relationship("Payment", back_populates="student")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="student")


class Dormitory(Base):
    __tablename__ = "dormitories"

    dorm_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(String(500))
    type = Column(String(20), nullable=False)
    total_rooms = Column(Integer)
    staff_id = Column(Integer, ForeignKey("staff.staff_id"))

    __table_args__ = (
        CheckConstraint("type IN ('mixed', 'male', 'female')", name="check_dorm_type"),
    )

    manager = relationship("Staff", back_populates="dormitories")
    rooms = relationship("Room", back_populates="dormitory")
    applications = relationship("Application", back_populates="dormitory")


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True)
    dorm_id = Column(Integer, ForeignKey("dormitories.dorm_id"), nullable=False)
    room_number = Column(String(20), nullable=False)
    room_type = Column(String(50))
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0, nullable=False)
    monthly_fee = Column(Numeric(10, 2))
    status = Column(String(20), default="available", nullable=False)

    __table_args__ = (
        CheckConstraint("current_occupancy >= 0", name="check_occupancy_non_negative"),
        CheckConstraint("current_occupancy <= capacity", name="check_occupancy_capacity"),
        CheckConstraint("status IN ('available', 'full', 'maintenance')", name="check_room_status"),
        CheckConstraint("room_type IN ('single', 'double', 'triple')", name="check_room_type"),
        Index("ix_rooms_dorm_id", "dorm_id"),
    )

    dormitory = relationship("Dormitory", back_populates="rooms")
    assignments = relationship("Assignment", back_populates="room")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="room")


class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    dorm_id = Column(Integer, ForeignKey("dormitories.dorm_id"), nullable=False)
    preferred_move_in = Column(Date)
    room_preference = Column(String(50))
    status = Column(String(20), default="pending", nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("staff.staff_id"), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'approved', 'rejected')", name="check_application_status"),
        Index("ix_applications_student_id", "student_id"),
        Index("ix_applications_dorm_id", "dorm_id"),
    )

    student = relationship("Student", back_populates="applications")
    dormitory = relationship("Dormitory", back_populates="applications")
    reviewer = relationship("Staff", back_populates="reviewed_applications")
    assignment = relationship("Assignment", back_populates="application", uselist=False)


class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.application_id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=True)
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'completed')", name="check_assignment_status"),
        Index("ix_assignments_student_id", "student_id"),
        Index("ix_assignments_room_id", "room_id"),
    )

    student = relationship("Student", back_populates="assignments")
    room = relationship("Room", back_populates="assignments")
    application = relationship("Application", back_populates="assignment")
    payments = relationship("Payment", back_populates="assignment")


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(String(50), default="monthly")
    status = Column(String(20), default="unpaid", nullable=False)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date, nullable=True)
    receipt_number = Column(String(100), unique=True, nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('paid', 'unpaid', 'overdue')", name="check_payment_status"),
        Index("ix_payments_student_id", "student_id"),
        Index("ix_payments_assignment_id", "assignment_id"),
    )

    student = relationship("Student", back_populates="payments")
    assignment = relationship("Assignment", back_populates="payments")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("staff.staff_id"), nullable=True)
    category = Column(String(100))
    description = Column(Text)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="open", nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name="check_priority"),
        CheckConstraint("status IN ('open', 'in_progress', 'resolved')", name="check_maintenance_status"),
        Index("ix_maintenance_room_id", "room_id"),
        Index("ix_maintenance_student_id", "student_id"),
    )

    room = relationship("Room", back_populates="maintenance_requests")
    student = relationship("Student", back_populates="maintenance_requests")
    assigned_staff = relationship("Staff", back_populates="maintenance_assignments")
