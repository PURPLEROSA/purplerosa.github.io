"""
Branded Image Generator
Creates branded images for Telegram posts using Pillow.
"""

import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

import config


# Brand colors
COLORS = {
    "bg_gradient_start": (88, 28, 135),    # Deep purple
    "bg_gradient_end": (219, 39, 119),      # Pink
    "text_primary": (255, 255, 255),        # White
    "text_secondary": (253, 224, 255),      # Light pink
    "accent": (250, 204, 21),               # Gold
    "overlay": (0, 0, 0, 80),              # Semi-transparent black
}

IMAGE_WIDTH = 1080
IMAGE_HEIGHT = 1080


def _get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a font, falling back to default if custom fonts aren't available."""
    font_dir = config.FONT_PATH

    if bold:
        candidates = ["NotoSansHebrew-Bold.ttf", "Arial-Bold.ttf", "DejaVuSans-Bold.ttf"]
    else:
        candidates = ["NotoSansHebrew-Regular.ttf", "Arial.ttf", "DejaVuSans.ttf"]

    for name in candidates:
        font_path = font_dir / name
        if font_path.exists():
            return ImageFont.truetype(str(font_path), size)

    # Try system fonts
    system_paths = [
        Path("/usr/share/fonts"),
        Path("/usr/local/share/fonts"),
        Path.home() / ".fonts",
    ]
    for sys_path in system_paths:
        for name in candidates:
            for match in sys_path.rglob(name):
                return ImageFont.truetype(str(match), size)

    return ImageFont.load_default()


def _draw_gradient(draw: ImageDraw.Draw, width: int, height: int):
    """Draw a vertical gradient background."""
    start = COLORS["bg_gradient_start"]
    end = COLORS["bg_gradient_end"]

    for y in range(height):
        ratio = y / height
        r = int(start[0] + (end[0] - start[0]) * ratio)
        g = int(start[1] + (end[1] - start[1]) * ratio)
        b = int(start[2] + (end[2] - start[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def _draw_decorative_elements(draw: ImageDraw.Draw, width: int, height: int):
    """Add subtle decorative elements to the image."""
    # Top-right circle
    draw.ellipse(
        [width - 200, -100, width + 100, 200],
        fill=(255, 255, 255, 15),
    )
    # Bottom-left circle
    draw.ellipse(
        [-100, height - 200, 200, height + 100],
        fill=(255, 255, 255, 10),
    )


def generate_image(
    title: str,
    subtitle: str = "",
    output_path: str | Path | None = None,
) -> Path:
    """
    Generate a branded image with text overlay.

    Args:
        title: Main text to display (Hebrew, will be wrapped).
        subtitle: Optional subtitle/category label.
        output_path: Where to save the image. Defaults to output/post_image.png.

    Returns:
        Path to the generated image.
    """
    if output_path is None:
        output_path = config.OUTPUT_DIR / "post_image.png"
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGBA", (IMAGE_WIDTH, IMAGE_HEIGHT))
    draw = ImageDraw.Draw(img)

    # Background gradient
    _draw_gradient(draw, IMAGE_WIDTH, IMAGE_HEIGHT)

    # Decorative elements
    _draw_decorative_elements(draw, IMAGE_WIDTH, IMAGE_HEIGHT)

    # Brand badge at top
    brand_font = _get_font(32, bold=True)
    brand_text = "AI.GOS"
    draw.text(
        (IMAGE_WIDTH // 2, 80),
        brand_text,
        font=brand_font,
        fill=COLORS["accent"],
        anchor="mm",
    )

    # Subtitle / category
    if subtitle:
        sub_font = _get_font(28)
        draw.text(
            (IMAGE_WIDTH // 2, 130),
            subtitle,
            font=sub_font,
            fill=COLORS["text_secondary"],
            anchor="mm",
        )

    # Main title text - wrapped for RTL Hebrew
    title_font = _get_font(52, bold=True)
    wrapped = textwrap.fill(title, width=25)
    lines = wrapped.split("\n")

    y_start = IMAGE_HEIGHT // 2 - (len(lines) * 70) // 2
    for i, line in enumerate(lines):
        draw.text(
            (IMAGE_WIDTH // 2, y_start + i * 70),
            line,
            font=title_font,
            fill=COLORS["text_primary"],
            anchor="mm",
        )

    # Bottom watermark
    watermark_font = _get_font(22)
    draw.text(
        (IMAGE_WIDTH // 2, IMAGE_HEIGHT - 60),
        "@ai.gos",
        font=watermark_font,
        fill=COLORS["text_secondary"],
        anchor="mm",
    )

    # Save as RGB (Telegram doesn't always handle RGBA well)
    rgb_img = Image.new("RGB", img.size, (0, 0, 0))
    rgb_img.paste(img, mask=img.split()[3])
    rgb_img.save(str(output_path), "PNG", quality=95)

    return output_path


def generate_post_image(post_text: str, output_path: str | Path | None = None) -> Path:
    """
    Generate an image for a post by extracting a short title from the post text.

    Args:
        post_text: The full post text (Hebrew).
        output_path: Where to save. Defaults to output/post_image.png.

    Returns:
        Path to the generated image.
    """
    # Use first line or first ~50 chars as the title
    first_line = post_text.strip().split("\n")[0]
    # Remove emojis for cleaner image text
    import re
    clean_title = re.sub(
        r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF'
        r'\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U0001F900-\U0001F9FF'
        r'\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002600-\U000026FF]+',
        '', first_line
    ).strip()

    if len(clean_title) > 60:
        clean_title = clean_title[:57] + "..."

    return generate_image(
        title=clean_title,
        subtitle="AI.GOS | בינה מלאכותית",
        output_path=output_path,
    )


if __name__ == "__main__":
    path = generate_image(
        title="כלי AI חדש שמשנה את הכללים",
        subtitle="חדשות טכנולוגיה",
    )
    print(f"Image saved to: {path}")
