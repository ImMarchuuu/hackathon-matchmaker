from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.db import db_dependency
from app.core.deps import get_current_user_id
from app.models.notification import NotificationResponse
from app.repositories import notification as notif_repo

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse], summary="Get my notifications")
async def get_notifications(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[NotificationResponse]:
    docs = await notif_repo.get_for_user(db, ObjectId(current_user_id))
    return [NotificationResponse.from_document(d) for d in docs]


@router.patch("/read-all", status_code=204, summary="Mark all notifications as read")
async def mark_all_read(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    await notif_repo.mark_all_read(db, ObjectId(current_user_id))


@router.delete("", status_code=204, summary="Delete all notifications")
async def delete_all(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    await notif_repo.delete_all_for_user(db, ObjectId(current_user_id))
