"""
Pydantic схемы для валидации данных
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ScheduleItem(BaseModel):
    """Пункт расписания"""
    time: str
    event: str
    description: Optional[str] = None


class WeddingSettingsCreate(BaseModel):
    """Схема для создания/обновления параметров свадьбы"""
    groom_name: str = Field(..., min_length=1)
    bride_name: str = Field(..., min_length=1)
    wedding_date: datetime
    wedding_time: str
    location: str
    dress_code: Optional[str] = None
    registry_info: Optional[str] = None
    main_color: str = "#8b7355"
    secondary_color: str = "#d4a574"
    accent_color: str = "#e8d5c4"
    schedule: Optional[List[ScheduleItem]] = None
    additional_info: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class WeddingSettings(WeddingSettingsCreate):
    """Схема свадьбы при чтении"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GuestCreate(BaseModel):
    """Схема для добавления гостя"""
    invitation_id: int
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    message: Optional[str] = None
    plus_one_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class Guest(GuestCreate):
    """Схема гостя при чтении"""
    id: int
    attending: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvitationCreate(BaseModel):
    """Схема для создания приглашения"""
    wedding_id: int
    type: str = "personal"  # personal или generic
    max_guests: int = 1
    personal_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Invitation(InvitationCreate):
    """Схема приглашения при чтении"""
    id: int
    code: str
    is_generic: bool
    qr_code_path: Optional[str] = None
    guests: List[Guest] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WeddingWithAll(WeddingSettings):
    """Полная информация о свадьбе с приглашениями"""
    invitations: List[Invitation] = []
    total_guests: int = 0
    confirmed_guests: int = 0

    model_config = ConfigDict(from_attributes=True)
