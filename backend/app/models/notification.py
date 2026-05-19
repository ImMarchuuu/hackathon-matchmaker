from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.base import PyObjectId

NotificationType = Literal["invite", "review", "follow", "favorite"]


class NotificationDocument(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    type: NotificationType
    payload: dict[str, Any] = {}
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    user_id: str
    type: NotificationType
    payload: dict[str, Any]
    read: bool
    created_at: datetime

    @classmethod
    def from_document(cls, doc: dict) -> "NotificationResponse":
        doc = {
            **doc,
            "_id": str(doc["_id"]),
            "user_id": str(doc["user_id"]),
        }
        return cls.model_validate(doc)
