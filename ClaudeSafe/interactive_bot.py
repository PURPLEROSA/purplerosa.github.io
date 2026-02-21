"""
Interactive Telegram Bot for ClaudeSafe

Flow:
1. Admin sends a message with a post idea
2. Bot uses Claude to write a Hebrew post (using tone_profile.txt)
3. Bot generates a branded image
4. Bot sends post + image for approval
5. Admin replies "שלח" to publish, "לא" to cancel
"""

import logging
from pathlib import Path

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

import config
from post_generator import generate_post
from image_generator import generate_post_image
from telegram_publisher import send_post

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Store pending posts per user: {user_id: {"text": ..., "image_path": ...}}
pending_posts: dict[int, dict] = {}


def is_admin(user_id: int) -> bool:
    """Check if the user is the authorized admin."""
    return user_id == config.TELEGRAM_ADMIN_ID


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("אין לך הרשאה להשתמש בבוט הזה.")
        return

    await update.message.reply_text(
        "שלום! אני הבוט של ClaudeSafe 🤖\n\n"
        "שלח/י לי רעיון לפוסט ואני אכתוב אותו בסגנון שלך, "
        "אייצר תמונה ממותגת, ואשלח לך לאישור.\n\n"
        "פקודות:\n"
        "/start - הודעת פתיחה\n"
        "/help - עזרה\n"
        "/alerts - שלוף פוסטים מ-Google Alerts\n\n"
        "או פשוט שלח/י לי רעיון לפוסט כטקסט חופשי."
    )


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command."""
    if not is_admin(update.effective_user.id):
        return

    await update.message.reply_text(
        "📝 איך להשתמש:\n\n"
        "1. שלח/י הודעה עם רעיון לפוסט\n"
        "2. אני אכתוב פוסט בעברית בסגנון שלך\n"
        "3. אייצר תמונה ממותגת\n"
        "4. אשלח לך הכל לאישור\n\n"
        "תשובות:\n"
        '• "שלח" - מפרסם לקבוצה\n'
        '• "לא" - מבטל\n'
        '• "נסה שוב" - יוצר גרסה חדשה\n\n'
        "פקודות:\n"
        "/alerts - שלוף מאמרים מ-Google Alerts ויצר פוסטים"
    )


async def cmd_alerts(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /alerts - fetch Google Alerts and generate posts."""
    if not is_admin(update.effective_user.id):
        return

    await update.message.reply_text("🔍 שולף מאמרים מ-Google Alerts...")

    try:
        from gmail_reader import get_alert_emails
        alerts = get_alert_emails(max_results=3)

        if not alerts:
            await update.message.reply_text("לא נמצאו התראות חדשות.")
            return

        await update.message.reply_text(
            f"נמצאו {len(alerts)} התראות. מייצר פוסט מהראשונה..."
        )

        alert = alerts[0]
        source_urls = alert.get("sources", [])
        topic = f"{alert['subject']}\n\n{alert['snippet']}"

        post_text = generate_post(topic=topic, source_urls=source_urls)
        image_path = generate_post_image(post_text)

        user_id = update.effective_user.id
        pending_posts[user_id] = {
            "text": post_text,
            "image_path": str(image_path),
        }

        # Send preview
        with open(image_path, "rb") as photo:
            await update.message.reply_photo(
                photo=photo,
                caption=(
                    f"📝 פוסט מוכן לאישור:\n\n{post_text}\n\n"
                    "---\n"
                    'שלח/י "שלח" לפרסום, "לא" לביטול, או "נסה שוב" לגרסה חדשה.'
                ),
            )

    except Exception as e:
        logger.error(f"Error in /alerts: {e}")
        await update.message.reply_text(
            f"שגיאה בשליפת ההתראות: {e}\n\n"
            "ודא/י שקובץ credentials.json קיים ושה-Gmail API מוגדר."
        )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming text messages from the admin."""
    user_id = update.effective_user.id
    if not is_admin(user_id):
        await update.message.reply_text("אין לך הרשאה להשתמש בבוט הזה.")
        return

    text = update.message.text.strip()

    # Check if this is a response to a pending post
    if user_id in pending_posts:
        await _handle_approval(update, text)
        return

    # Otherwise, treat as a new post idea
    await _generate_new_post(update, text)


async def _generate_new_post(update: Update, idea: str):
    """Generate a new post from an idea."""
    user_id = update.effective_user.id

    await update.message.reply_text("✍️ כותב פוסט... אנא המתן/י.")

    try:
        # Check if the idea contains a URL - treat it as a source
        source_urls = []
        import re
        urls = re.findall(r'https?://\S+', idea)
        if urls:
            source_urls = [{"title": "", "url": url} for url in urls]

        post_text = generate_post(topic=idea, source_urls=source_urls or None)

        await update.message.reply_text("🎨 מייצר תמונה ממותגת...")
        image_path = generate_post_image(post_text)

        # Store pending post
        pending_posts[user_id] = {
            "text": post_text,
            "image_path": str(image_path),
            "original_idea": idea,
        }

        # Send preview
        with open(image_path, "rb") as photo:
            await update.message.reply_photo(
                photo=photo,
                caption=(
                    f"📝 פוסט מוכן לאישור:\n\n{post_text}\n\n"
                    "---\n"
                    'שלח/י "שלח" לפרסום לקבוצה\n'
                    '"לא" לביטול\n'
                    '"נסה שוב" לגרסה חדשה'
                ),
            )

    except Exception as e:
        logger.error(f"Error generating post: {e}")
        await update.message.reply_text(f"שגיאה ביצירת הפוסט: {e}")


async def _handle_approval(update: Update, response: str):
    """Handle admin's response to a pending post."""
    user_id = update.effective_user.id
    post_data = pending_posts[user_id]
    response_lower = response.strip()

    if response_lower in ("שלח", "אשר", "כן", "פרסם"):
        # Publish to group
        await update.message.reply_text("📤 מפרסם לקבוצה...")

        result = await send_post(
            text=post_data["text"],
            image_path=post_data.get("image_path"),
        )

        if result["success"]:
            await update.message.reply_text("✅ הפוסט פורסם בהצלחה!")
        else:
            await update.message.reply_text(
                f"❌ שגיאה בפרסום: {result['error']}"
            )

        del pending_posts[user_id]

    elif response_lower in ("לא", "ביטול", "בטל"):
        # Cancel
        del pending_posts[user_id]
        await update.message.reply_text(
            "❌ הפוסט בוטל. שלח/י רעיון חדש מתי שתרצה/י."
        )

    elif response_lower in ("נסה שוב", "שוב", "חדש"):
        # Regenerate
        original_idea = post_data.get("original_idea", post_data["text"])
        del pending_posts[user_id]
        await _generate_new_post(update, original_idea)

    else:
        await update.message.reply_text(
            'לא הבנתי. שלח/י "שלח" לפרסום, "לא" לביטול, או "נסה שוב" לגרסה חדשה.'
        )


def main():
    """Start the bot."""
    if not config.TELEGRAM_BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN not set in .env")
        return

    if not config.TELEGRAM_ADMIN_ID:
        print("Error: TELEGRAM_ADMIN_ID not set in .env")
        return

    print("Starting ClaudeSafe Interactive Bot...")
    print(f"Admin user ID: {config.TELEGRAM_ADMIN_ID}")
    print(f"Group chat ID: {config.TELEGRAM_GROUP_ID}")

    app = Application.builder().token(config.TELEGRAM_BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("alerts", cmd_alerts))

    # Message handler for all text messages
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Bot is running. Press Ctrl+C to stop.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
