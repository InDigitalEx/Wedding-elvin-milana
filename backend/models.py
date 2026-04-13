"""
Модели данных для БД SQLite
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Wedding(Base):
    """Модель с описанием свадьбы"""
    __tablename__ = "weddings"

    id = Column(Integer, primary_key=True, index=True)
    groom_name = Column(String, default="Жених")
    bride_name = Column(String, default="Невеста")
    wedding_date = Column(DateTime)
    wedding_time = Column(String)
    location = Column(String)
    dress_code = Column(Text)
    registry_info = Column(Text)
    main_color = Column(String, default="#8b7355")
    secondary_color = Column(String, default="#d4a574")
    accent_color = Column(String, default="#e8d5c4")
    schedule = Column(JSON)  # Расписание события
    additional_info = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invitations = relationship("Invitation", back_populates="wedding")


class Invitation(Base):
    """Модель приглашения"""
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    wedding_id = Column(Integer, ForeignKey("weddings.id"))
    code = Column(String, unique=True, index=True)
    is_generic = Column(Boolean, default=False)  # True для общего приглашения
    type = Column(String, default="personal")  # personal или generic
    max_guests = Column(Integer, default=1)
    personal_message = Column(Text)
    qr_code_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="invitations")
    guests = relationship("Guest", back_populates="invitation", cascade="all, delete-orphan")


class Guest(Base):
    """Модель гостя"""
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    invitation_id = Column(Integer, ForeignKey("invitations.id"))
    name = Column(String)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    dietary_preferences = Column(JSON, default=list)  # ["vegetarian", "vegan", etc.]
    attending = Column(Boolean, default=None)  # None = не ответил, True = да, False = нет
    message = Column(Text, nullable=True)
    plus_one_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invitation = relationship("Invitation", back_populates="guests")
