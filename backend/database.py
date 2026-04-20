"""
Конфигурация базы данных SQLite
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Путь к БД
DATABASE_URL = "sqlite:///./wedding.db"

# Создание двигателя БД
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Фабрика сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


def get_db():
    """Зависимость для получения сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Инициализация БД"""
    Base.metadata.create_all(bind=engine)
    
    # Создать первую свадьбу если ее нет
    db = SessionLocal()
    from models import Wedding
    from datetime import datetime, timedelta
    
    existing_wedding = db.query(Wedding).first()
    if not existing_wedding:
        default_wedding = Wedding(
            groom_name="Жених",
            bride_name="Невеста",
            wedding_date=datetime.now() + timedelta(days=30),
            wedding_time="18:00",
            location="Будет позже...",
            dress_code="Будет позже...",
            registry_info="Будет позже...",
            main_color="#8b7355",
            secondary_color="#d4a574",
            accent_color="#e8d5c4",
            schedule=[
                {"time": "18:00", "event": "Начало"}
            ]
        )
        db.add(default_wedding)
        db.commit()
    
    db.close()
    print("✅ База данных инициализирована")
