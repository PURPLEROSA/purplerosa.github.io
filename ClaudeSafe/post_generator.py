"""
Post Generator using Claude API
Generates Hebrew posts in the user's voice based on tone_profile.txt.
Includes source links at the end of each post.
"""

import anthropic
import config


def load_tone_profile() -> str:
    """Load the tone profile from file."""
    if config.TONE_PROFILE_PATH.exists():
        return config.TONE_PROFILE_PATH.read_text(encoding="utf-8")
    return ""


def generate_post(
    topic: str,
    source_urls: list[dict] | None = None,
    tone_profile: str | None = None,
) -> str:
    """
    Generate a Hebrew post using Claude.

    Args:
        topic: The topic or idea for the post (can be Hebrew or English).
        source_urls: Optional list of source dicts [{"title": "...", "url": "..."}].
        tone_profile: Optional override for tone profile text.

    Returns:
        The generated Hebrew post text with source links appended.
    """
    if tone_profile is None:
        tone_profile = load_tone_profile()

    source_instruction = ""
    if source_urls:
        links_text = "\n".join(
            f"- {src.get('title', src['url'])}: {src['url']}" for src in source_urls
        )
        source_instruction = (
            f"\n\nקישורי מקור שיש לכלול בסוף הפוסט:\n{links_text}\n"
            "הוסף בסוף הפוסט שורה:\n"
            "🔗 לקריאה נוספת: [URL]\n"
            "אם יש מספר קישורים, הוסף את הרלוונטי ביותר. "
            "אם הקישור ארוך מדי, השתמש רק בדומיין."
        )

    system_prompt = (
        "אתה כותב תוכן מקצועי בעברית עבור קבוצת טלגרם.\n"
        "הנה פרופיל הטון והסגנון שלך:\n\n"
        f"{tone_profile}\n\n"
        "כללים חשובים:\n"
        "- כתוב רק בעברית (מונחים טכניים באנגלית מותרים)\n"
        "- שמור על אורך מקסימלי של 200 מילים\n"
        "- אל תוסיף כותרת או תגיות\n"
        "- כתוב פוסט אחד בלבד, מוכן לפרסום\n"
        "- אל תוסיף הערות מטא או הסברים, רק את הפוסט עצמו"
    )

    user_prompt = f"כתוב פוסט על הנושא הבא:\n{topic}{source_instruction}"

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return message.content[0].text


def generate_post_from_alert(alert: dict) -> str:
    """
    Generate a post from a Google Alerts email dict.

    Args:
        alert: Dict with keys "subject", "snippet", "sources", "body_text".

    Returns:
        Generated Hebrew post text.
    """
    topic = f"{alert['subject']}\n\n{alert['snippet']}"
    return generate_post(topic=topic, source_urls=alert.get("sources"))


if __name__ == "__main__":
    test_post = generate_post(
        topic="כלי AI חדש שמאפשר ליצור תמונות מטקסט בלבד",
        source_urls=[
            {"title": "TechCrunch Article", "url": "https://techcrunch.com/example"}
        ],
    )
    print(test_post)
