"""
CRUD операции для работы с БД
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Wedding, Invitation, Guest
from schemas import WeddingSettingsCreate, InvitationCreate, GuestCreate
import uuid
import qrcode
from io import BytesIO
import os
from datetime import datetime


class WeddingCRUD:
    """Операции с данными свадьбы"""

    @staticmethod
    def get_wedding(db: Session):
        """Получить первую (единственную) свадьбу"""
        return db.query(Wedding).first()

    @staticmethod
    def create_or_update_wedding(db: Session, wedding_data: WeddingSettingsCreate):
        """Создать или обновить свадьбу"""
        wedding = db.query(Wedding).first()
        
        if wedding:
            # Обновление
            for key, value in wedding_data.model_dump().items():
                setattr(wedding, key, value)
        else:
            # Создание
            wedding = Wedding(**wedding_data.model_dump())
            db.add(wedding)
        
        db.commit()
        db.refresh(wedding)
        return wedding

    @staticmethod
    def get_wedding_with_all(db: Session):
        """Получить свадьбу со всеми приглашениями и гостями"""
        wedding = db.query(Wedding).first()
        if not wedding:
            return None
        
        # Подсчет гостей
        total_guests = db.query(func.count(Guest.id)).filter(
            Guest.invitation_id.in_(
                db.query(Invitation.id).filter(Invitation.wedding_id == wedding.id)
            )
        ).scalar()
        
        confirmed_guests = db.query(func.count(Guest.id)).filter(
            Guest.invitation_id.in_(
                db.query(Invitation.id).filter(Invitation.wedding_id == wedding.id)
            ),
            Guest.attending == True
        ).scalar()
        
        result = {
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
            "invitations": wedding.invitations,
            "total_guests": total_guests or 0,
            "confirmed_guests": confirmed_guests or 0,
            "created_at": wedding.created_at,
            "updated_at": wedding.updated_at
        }
        return result

    @staticmethod
    def get_statistics(db: Session):
        """Получить статистику по гостям"""
        wedding = db.query(Wedding).first()
        if not wedding:
            return {}
        
        all_invitations = db.query(Invitation).filter(Invitation.wedding_id == wedding.id).all()
        invitation_ids = [inv.id for inv in all_invitations]
        
        total_guests = db.query(func.count(Guest.id)).filter(Guest.invitation_id.in_(invitation_ids)).scalar() or 0
        confirmed = db.query(func.count(Guest.id)).filter(Guest.invitation_id.in_(invitation_ids), Guest.attending == True).scalar() or 0
        not_confirmed = db.query(func.count(Guest.id)).filter(Guest.invitation_id.in_(invitation_ids), Guest.attending == False).scalar() or 0
        no_response = db.query(func.count(Guest.id)).filter(Guest.invitation_id.in_(invitation_ids), Guest.attending == None).scalar() or 0
        
        return {
            "total_invitations": len(all_invitations),
            "total_guests": total_guests,
            "confirmed": confirmed,
            "not_confirmed": not_confirmed,
            "no_response": no_response,
            "confirmation_rate": round((confirmed / total_guests * 100) if total_guests > 0 else 0, 2)
        }


class InvitationCRUD:
    """Операции с приглашениями"""

    @staticmethod
    def _generate_code():
        """Генерировать уникальный код приглашения"""
        return f"INV-{uuid.uuid4().hex[:8].upper()}"

    @staticmethod
    def get_all_invitations(db: Session):
        """Получить все приглашения"""
        return db.query(Invitation).all()

    @staticmethod
    def create_invitation(db: Session, invitation_data: InvitationCreate):
        """Создать новое приглашение"""
        code = InvitationCRUD._generate_code()
        
        new_invitation = Invitation(
            **invitation_data.model_dump(),
            code=code,
            is_generic=invitation_data.type == "generic"
        )
        
        db.add(new_invitation)
        db.commit()
        db.refresh(new_invitation)
        
        return new_invitation

    @staticmethod
    def get_invitation_by_code(db: Session, code: str):
        """Получить приглашение по коду"""
        return db.query(Invitation).filter(Invitation.code == code).first()

    @staticmethod
    def delete_invitation(db: Session, code: str):
        """Удалить приглашение"""
        invitation = db.query(Invitation).filter(Invitation.code == code).first()
        if not invitation:
            return False
        
        db.delete(invitation)
        db.commit()
        return True

    @staticmethod
    def generate_qr_code(code: str, size: int = 300):
        """Генерировать QR код для приглашения"""
        os.makedirs("./qr_codes", exist_ok=True)
        
        qr_path = f"./qr_codes/{code}.png"
        
        # Генерируем URL для приглашения
        url = f"http://localhost:3000/invitation?code={code}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img = img.resize((size, size))
        img.save(qr_path)
        
        return qr_path


class GuestCRUD:
    """Операции с гостями"""

    @staticmethod
    def get_all_guests(db: Session):
        """Получить всех гостей"""
        return db.query(Guest).all()

    @staticmethod
    def get_guests_by_invitation(db: Session, invitation_code: str):
        """Получить гостей по коду приглашения"""
        invitation = db.query(Invitation).filter(Invitation.code == invitation_code).first()
        if not invitation:
            return []
        return db.query(Guest).filter(Guest.invitation_id == invitation.id).all()

    @staticmethod
    def create_guest(db: Session, guest_data: GuestCreate):
        """Добавить гостя"""
        new_guest = Guest(**guest_data.model_dump())
        db.add(new_guest)
        db.commit()
        db.refresh(new_guest)
        return new_guest

    @staticmethod
    def confirm_guest(db: Session, guest_id: int, attending: bool = True):
        """Подтвердить присутствие гостя"""
        guest = db.query(Guest).filter(Guest.id == guest_id).first()
        if not guest:
            return None
        
        guest.attending = attending
        guest.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(guest)
        return guest

    @staticmethod
    def delete_guest(db: Session, guest_id: int):
        """Удалить гостя"""
        guest = db.query(Guest).filter(Guest.id == guest_id).first()
        if not guest:
            return False
        
        db.delete(guest)
        db.commit()
        return True


# Экземпляры CRUD классов
wedding_crud = WeddingCRUD()
invitation_crud = InvitationCRUD()
guest_crud = GuestCRUD()
