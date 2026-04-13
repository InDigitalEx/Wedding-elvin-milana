"""
❤️ Свадебный сайт с системой приглашений
Главный файл приложения FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from datetime import datetime
import logging

from database import init_db, get_db, engine
from models import Base
from schemas import (
    WeddingSettingsCreate, WeddingSettings,
    InvitationCreate, Invitation,
    GuestCreate, Guest,
    WeddingWithAll
)
from crud import (
    wedding_crud, invitation_crud, guest_crud
)

# Инициализация логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание приложения
app = FastAPI(
    title="🎉 Свадебный сайт API",
    description="API для управления свадебными приглашениями",
    version="1.0.0"
)

# CORS конфигурация
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация БД
Base.metadata.create_all(bind=engine)
init_db()


# ==================== СВАДЕБНЫЕ ПАРАМЕТРЫ ====================

@app.get("/api/wedding", response_model=dict)
def get_wedding_settings(db: Session = Depends(get_db)):
    """Получить параметры свадьбы"""
    wedding = wedding_crud.get_wedding(db)
    if not wedding:
        raise HTTPException(status_code=404, detail="Параметры свадьбы не установлены")
    return wedding


@app.post("/api/wedding", response_model=dict)
def create_or_update_wedding(settings: WeddingSettingsCreate, db: Session = Depends(get_db)):
    """Создать или обновить параметры свадьбы"""
    wedding = wedding_crud.create_or_update_wedding(db, settings)
    return wedding


@app.get("/api/wedding/full", response_model=dict)
def get_wedding_full(db: Session = Depends(get_db)):
    """Получить полную информацию о свадьбе с приглашениями и гостями"""
    wedding = wedding_crud.get_wedding_with_all(db)
    if not wedding:
        raise HTTPException(status_code=404, detail="Параметры свадьбы не установлены")
    return wedding


# ==================== ПРИГЛАШЕНИЯ ====================

@app.get("/api/invitations", response_model=list)
def list_invitations(db: Session = Depends(get_db)):
    """Получить список всех приглашений"""
    return invitation_crud.get_all_invitations(db)


@app.post("/api/invitations", response_model=dict)
def create_invitation(invitation: InvitationCreate, db: Session = Depends(get_db)):
    """Создать новое приглашение"""
    new_invitation = invitation_crud.create_invitation(db, invitation)
    return new_invitation


@app.get("/api/invitations/{invitation_code}", response_model=dict)
def get_invitation(invitation_code: str, db: Session = Depends(get_db)):
    """Получить приглашение по коду"""
    invitation = invitation_crud.get_invitation_by_code(db, invitation_code)
    if not invitation:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")
    return invitation


@app.delete("/api/invitations/{invitation_code}")
def delete_invitation(invitation_code: str, db: Session = Depends(get_db)):
    """Удалить приглашение"""
    success = invitation_crud.delete_invitation(db, invitation_code)
    if not success:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")
    return {"message": "Приглашение удалено"}


@app.get("/api/invitations/{invitation_code}/qr")
def get_invitation_qr(invitation_code: str, db: Session = Depends(get_db)):
    """Получить QR код приглашения"""
    qr_path = invitation_crud.generate_qr_code(invitation_code)
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=404, detail="QR код не найден")
    return FileResponse(qr_path, media_type="image/png")


# ==================== ГОСТИ ====================

@app.get("/api/guests", response_model=list)
def list_guests(invitation_code: str = None, db: Session = Depends(get_db)):
    """Получить список гостей"""
    if invitation_code:
        return guest_crud.get_guests_by_invitation(db, invitation_code)
    return guest_crud.get_all_guests(db)


@app.post("/api/guests", response_model=dict)
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    """Добавить нового гостя в приглашение"""
    new_guest = guest_crud.create_guest(db, guest)
    return new_guest


@app.put("/api/guests/{guest_id}/confirm")
def confirm_guest(guest_id: int, db: Session = Depends(get_db)):
    """Подтвердить присутствие гостя"""
    guest = guest_crud.confirm_guest(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Гость не найден")
    return guest


@app.delete("/api/guests/{guest_id}")
def delete_guest(guest_id: int, db: Session = Depends(get_db)):
    """Удалить гостя"""
    success = guest_crud.delete_guest(db, guest_id)
    if not success:
        raise HTTPException(status_code=404, detail="Гость не найден")
    return {"message": "Гость удален"}


# ==================== СТАТИСТИКА ====================

@app.get("/api/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """Получить статистику по гостям"""
    stats = wedding_crud.get_statistics(db)
    return stats


# ==================== ОБЩИЕ ====================

@app.get("/api/health")
def health_check():
    """Проверка здоровья API"""
    return {"status": "OK", "timestamp": datetime.now().isoformat()}


@app.get("/")
def root():
    """Корневой путь"""
    return {
        "message": "🎉 Свадебный сайт API",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
