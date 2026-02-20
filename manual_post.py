#!/usr/bin/env python3
"""
Manual Post Tool - Interactive script for creating and posting content.
Run: python manual_post.py
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env in the script's directory
SCRIPT_DIR = Path(__file__).resolve().parent
load_dotenv(SCRIPT_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TONE_FILE = SCRIPT_DIR / "tone_profile.txt"
DRAFTS_DIR = SCRIPT_DIR / "drafts"


def check_setup():
    """Verify all required config is in place."""
    missing = []
    if not OPENAI_API_KEY:
        missing.append("OPENAI_API_KEY")
    if not TELEGRAM_BOT_TOKEN:
        missing.append("TELEGRAM_BOT_TOKEN")
    if not TELEGRAM_CHAT_ID:
        missing.append("TELEGRAM_CHAT_ID")
    if missing:
        print(f"\n❌ Missing in .env: {', '.join(missing)}")
        print(f"   Copy .env.example to .env and fill in your keys.")
        sys.exit(1)
    if not TONE_FILE.exists():
        print(f"\n❌ tone_profile.txt not found at {TONE_FILE}")
        sys.exit(1)


def read_tone_profile():
    """Read the tone profile file."""
    return TONE_FILE.read_text(encoding="utf-8")


def get_user_input():
    """Get text/idea from user via stdin."""
    print("\n📝 כתבי את הטקסט או הרעיון שלך בעברית:")
    print("   (כדי לסיים, לחצי Enter פעמיים)")
    print()

    lines = []
    empty_count = 0
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == "":
            empty_count += 1
            if empty_count >= 1 and lines:
                break
            continue
        else:
            empty_count = 0
            lines.append(line)

    text = "\n".join(lines).strip()
    if not text:
        print("\n❌ לא הוזן טקסט. יוצא.")
        sys.exit(0)
    return text


def rewrite_post(client, raw_text, tone_profile):
    """Rewrite the text in the user's tone using OpenAI."""
    print("\n✍️  כותב מחדש בסגנון שלך...")

    prompt = f"""אתה כותב תוכן לרשתות חברתיות בעברית.

הנה פרופיל הטון שלי:
---
{tone_profile}
---

קיבלת את הרעיון/טקסט הבא:
---
{raw_text}
---

כתוב מחדש את הפוסט לפי הכללים הבאים:
1. פתח עם hook חזק שתופס תשומת לב
2. השתמש באימוג'ים בצורה טבעית
3. הוסף hot take - דעה חדה ומעניינת
4. סיים עם שאלה שגורמת לאנשים להגיב
5. שמור על הטון מפרופיל הטון שלי
6. אורך: 3-7 משפטים

החזר רק את הפוסט המוגמר, בלי הסברים."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()


def generate_image(client, post_text):
    """Generate a matching image using DALL-E 3."""
    print("🎨 מייצר תמונה תואמת...")

    image_prompt = f"""Create a photorealistic square image for a social media post.
The image should match this Hebrew post content: {post_text}

Rules:
- Square format (1:1 ratio)
- Photorealistic style
- Include a small subtle avatar/logo watermark area in the bottom-right corner with "PR" initials in purple
- Leave space at the top for a bold headline overlay
- Professional, eye-catching, modern look
- Vibrant colors with purple accent tones
- Clean composition suitable for Telegram/Instagram"""

    response = client.images.generate(
        model="dall-e-3",
        prompt=image_prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url

    # Download image
    img_response = requests.get(image_url, timeout=60)
    img_response.raise_for_status()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    img_path = SCRIPT_DIR / f"post_image_{timestamp}.png"
    img_path.write_bytes(img_response.content)

    print(f"   💾 תמונה נשמרה: {img_path.name}")
    return img_path


def show_preview(post_text, image_path):
    """Show the user a preview of the post."""
    print("\n" + "=" * 50)
    print("📋 תצוגה מקדימה של הפוסט:")
    print("=" * 50)
    print()
    print(post_text)
    print()
    print(f"🖼️  תמונה: {image_path.name}")
    print("=" * 50)


def send_to_telegram(post_text, image_path):
    """Send the post + image to the Telegram group."""
    print("\n📤 שולח לטלגרם...")

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"

    with open(image_path, "rb") as photo:
        response = requests.post(
            url,
            data={
                "chat_id": TELEGRAM_CHAT_ID,
                "caption": post_text,
                "parse_mode": "HTML",
            },
            files={"photo": photo},
            timeout=30,
        )

    if response.status_code == 200:
        print("✅ הפוסט נשלח בהצלחה לטלגרם!")
        return True
    else:
        error = response.json().get("description", "Unknown error")
        print(f"❌ שגיאה בשליחה: {error}")
        return False


def save_draft(post_text, image_path):
    """Save the post as a local draft."""
    DRAFTS_DIR.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    draft_path = DRAFTS_DIR / f"draft_{timestamp}.txt"

    draft_content = f"""--- Draft: {timestamp} ---

{post_text}

Image: {image_path.name}
"""
    draft_path.write_text(draft_content, encoding="utf-8")

    # Move image to drafts folder too
    new_img_path = DRAFTS_DIR / image_path.name
    image_path.rename(new_img_path)

    print(f"\n💾 טיוטה נשמרה: {draft_path.name}")
    print(f"   🖼️  תמונה: {new_img_path}")


def main():
    print("=" * 50)
    print("  🟣 PurpleRosa - Manual Post Tool")
    print("=" * 50)

    check_setup()

    client = OpenAI(api_key=OPENAI_API_KEY)
    tone_profile = read_tone_profile()

    # Step 1: Get user input
    raw_text = get_user_input()

    # Step 2: Rewrite in tone
    post_text = rewrite_post(client, raw_text, tone_profile)

    # Step 3: Generate image
    image_path = generate_image(client, post_text)

    # Step 4: Show preview
    show_preview(post_text, image_path)

    # Step 5: Ask to send
    print()
    answer = input("📨 לשלוח לטלגרם? (y/n): ").strip().lower()

    if answer == "y":
        send_to_telegram(post_text, image_path)
    else:
        save_draft(post_text, image_path)
        print("\n👋 הפוסט נשמר כטיוטה. תוכלי לשלוח אותו מאוחר יותר.")


if __name__ == "__main__":
    main()
