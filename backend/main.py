"""
❤️ Свадебный сайт с системой приглашений
Главный файл приложения FastAPI
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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


# ==================== HELPER ФУНКЦИИ ====================

def invitation_to_dict(invitation):
    """Преобразовать объект Invitation в словарь"""
    return {
        "id": invitation.id,
        "code": invitation.code,
        "type": invitation.type,
        "is_generic": invitation.is_generic,
        "max_guests": invitation.max_guests,
        "personal_message": invitation.personal_message,
        "qr_code_path": invitation.qr_code_path,
        "guests": [guest_to_dict(g) for g in invitation.guests] if hasattr(invitation, 'guests') else [],
        "created_at": invitation.created_at,
        "updated_at": invitation.updated_at,
    }

def guest_to_dict(guest):
    """Преобразовать объект Guest в словарь"""
    return {
        "id": guest.id,
        "invitation_id": guest.invitation_id,
        "name": guest.name,
        "email": guest.email,
        "phone": guest.phone,
        "dietary_preferences": guest.dietary_preferences,
        "attending": guest.attending,
        "message": guest.message,
        "created_at": guest.created_at,
        "updated_at": guest.updated_at,
    }


# ==================== СВАДЕБНЫЕ ПАРАМЕТРЫ ====================

@app.get("/api/wedding", response_model=dict)
def get_wedding_settings(db: Session = Depends(get_db)):
    """Получить параметры свадьбы"""
    wedding = wedding_crud.get_wedding(db)
    if not wedding:
        raise HTTPException(status_code=404, detail="Параметры свадьбы не установлены")
    # Преобразовать в словарь
    return {
        "id": wedding.id,
        "groom_name": wedding.groom_name,
        "bride_name": wedding.bride_name,
        "wedding_date": wedding.wedding_date,
        "wedding_time": wedding.wedding_time,
        "location": wedding.location,
        "dress_code": wedding.dress_code,
        "registry_info": wedding.registry_info,
        "main_color": wedding.main_color,
        "secondary_color": wedding.secondary_color,
        "accent_color": wedding.accent_color,
        "schedule": wedding.schedule,
        "additional_info": wedding.additional_info,
        "created_at": wedding.created_at,
        "updated_at": wedding.updated_at
    }


@app.post("/api/wedding", response_model=dict)
def create_or_update_wedding(settings: WeddingSettingsCreate, db: Session = Depends(get_db)):
    """Создать или обновить параметры свадьбы"""
    wedding = wedding_crud.create_or_update_wedding(db, settings)
    # Преобразовать в словарь
    return {
        "id": wedding.id,
        "groom_name": wedding.groom_name,
        "bride_name": wedding.bride_name,
        "wedding_date": wedding.wedding_date,
        "wedding_time": wedding.wedding_time,
        "location": wedding.location,
        "dress_code": wedding.dress_code,
        "registry_info": wedding.registry_info,
        "main_color": wedding.main_color,
        "secondary_color": wedding.secondary_color,
        "accent_color": wedding.accent_color,
        "schedule": wedding.schedule,
        "additional_info": wedding.additional_info,
        "created_at": wedding.created_at,
        "updated_at": wedding.updated_at
    }


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
    invitations = invitation_crud.get_all_invitations(db)
    return [invitation_to_dict(inv) for inv in invitations]


@app.post("/api/invitations", response_model=dict)
def create_invitation(invitation: InvitationCreate, db: Session = Depends(get_db)):
    """Создать новое приглашение"""
    new_invitation = invitation_crud.create_invitation(db, invitation)
    return invitation_to_dict(new_invitation)


@app.get("/api/invitations/{invitation_code}", response_model=dict)
def get_invitation(invitation_code: str, db: Session = Depends(get_db)):
    """Получить приглашение по коду"""
    invitation = invitation_crud.get_invitation_by_code(db, invitation_code)
    if not invitation:
        raise HTTPException(status_code=404, detail="Приглашение не найдено")
    return invitation_to_dict(invitation)


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
        guests = guest_crud.get_guests_by_invitation(db, invitation_code)
    else:
        guests = guest_crud.get_all_guests(db)
    return [guest_to_dict(g) for g in guests]


@app.post("/api/guests", response_model=dict)
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    """Добавить нового гостя в приглашение"""
    new_guest = guest_crud.create_guest(db, guest)
    return guest_to_dict(new_guest)


@app.put("/api/guests/{guest_id}/confirm")
def confirm_guest(guest_id: int, db: Session = Depends(get_db)):
    """Подтвердить присутствие гостя"""
    guest = guest_crud.confirm_guest(db, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Гость не найден")
    return guest_to_dict(guest)


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
    """Корневой путь - возвращает главную страницу"""
    frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    return FileResponse(os.path.join(frontend_path, "index.html"), media_type="text/html")


# ==================== СТАТИЧЕСКИЕ ФАЙЛЫ ====================

# Подсчитываем абсолютный путь к фронтенду
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

# Сервирование главной страницы и assets
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")
app.mount("/js", StaticFiles(directory=os.path.join(frontend_path, "js")), name="js")
app.mount("/css", StaticFiles(directory=os.path.join(frontend_path, "css")), name="css")

# Главная страница
@app.get("/index.html")
def serve_index():
    return FileResponse(os.path.join(frontend_path, "index.html"), media_type="text/html")

@app.get("/admin/index.html")
def serve_admin_index():
    return FileResponse(os.path.join(frontend_path, "admin", "index.html"), media_type="text/html")

# Переадресация на HTML если запрашивается директория без расширения файла
@app.get("/{path_name:path}")
def catch_all(path_name: str):
    if path_name == "":
        return FileResponse(os.path.join(frontend_path, "index.html"), media_type="text/html")
    
    file_path = os.path.abspath(os.path.join(frontend_path, path_name))
    
    # Убедиться что путь находится внутри frontend папки
    if not file_path.startswith(frontend_path):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Если это директория, попробовать index.html
    if os.path.isdir(file_path):
        index_path = os.path.join(file_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path, media_type="text/html")
    
    # Если это файл, вернуть его
    if os.path.exists(file_path):
        return FileResponse(file_path)
    
    raise HTTPException(status_code=404, detail="Not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
