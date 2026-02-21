"""
Telegram Publisher
Handles sending posts and images to a Telegram group.
"""

from pathlib import Path
from telegram import Bot
from telegram.constants import ParseMode

import config


async def send_post(
    text: str,
    image_path: Path | str | None = None,
    chat_id: str | None = None,
) -> dict:
    """
    Send a post to the Telegram group.

    Args:
        text: The post text to send.
        image_path: Optional path to an image to send with the post.
        chat_id: Override for the target chat ID.

    Returns:
        Dict with "success" bool and "message_id" or "error".
    """
    chat_id = chat_id or config.TELEGRAM_GROUP_ID
    bot = Bot(token=config.TELEGRAM_BOT_TOKEN)

    try:
        if image_path:
            image_path = Path(image_path)
            with open(image_path, "rb") as photo:
                message = await bot.send_photo(
                    chat_id=chat_id,
                    photo=photo,
                    caption=text,
                    parse_mode=ParseMode.HTML,
                )
        else:
            message = await bot.send_message(
                chat_id=chat_id,
                text=text,
                parse_mode=ParseMode.HTML,
                disable_web_page_preview=False,
            )

        return {"success": True, "message_id": message.message_id}

    except Exception as e:
        return {"success": False, "error": str(e)}


async def send_message_to_user(
    text: str,
    user_id: int | None = None,
    image_path: Path | str | None = None,
) -> dict:
    """
    Send a message directly to the admin user.

    Args:
        text: Message text.
        user_id: Telegram user ID. Defaults to TELEGRAM_ADMIN_ID.
        image_path: Optional image to attach.

    Returns:
        Dict with "success" and "message_id" or "error".
    """
    user_id = user_id or config.TELEGRAM_ADMIN_ID
    return await send_post(text=text, image_path=image_path, chat_id=str(user_id))
