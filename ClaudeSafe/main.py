"""
ClaudeSafe - Main Automation Script

Automated pipeline:
1. Read Google Alerts emails
2. Extract source URLs
3. Generate Hebrew posts with Claude
4. Generate branded images
5. Publish to Telegram group

For interactive use, run interactive_bot.py instead.
"""

import asyncio
import argparse
import logging

from gmail_reader import get_alert_emails
from post_generator import generate_post, generate_post_from_alert
from image_generator import generate_post_image
from telegram_publisher import send_post
import config

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def process_alerts(max_alerts: int = 3, auto_publish: bool = False):
    """
    Process Google Alerts: read emails, generate posts, optionally publish.

    Args:
        max_alerts: Maximum number of alerts to process.
        auto_publish: If True, publish directly. If False, just print.
    """
    logger.info("Fetching Google Alerts...")
    alerts = get_alert_emails(max_results=max_alerts)

    if not alerts:
        logger.info("No alerts found.")
        return

    logger.info(f"Found {len(alerts)} alerts.")

    for i, alert in enumerate(alerts):
        logger.info(f"\n{'='*60}")
        logger.info(f"Alert {i+1}: {alert['subject']}")
        logger.info(f"Sources: {len(alert['sources'])}")

        for src in alert["sources"]:
            logger.info(f"  - {src['title']}: {src['url']}")

        # Generate post
        logger.info("Generating post with Claude...")
        post_text = generate_post_from_alert(alert)
        logger.info(f"\nGenerated post:\n{post_text}\n")

        # Generate image
        logger.info("Generating image...")
        image_path = generate_post_image(post_text)
        logger.info(f"Image saved to: {image_path}")

        if auto_publish:
            logger.info("Publishing to Telegram...")
            result = await send_post(text=post_text, image_path=image_path)
            if result["success"]:
                logger.info(f"Published! Message ID: {result['message_id']}")
            else:
                logger.error(f"Failed to publish: {result['error']}")
        else:
            logger.info("Dry run - not publishing. Use --publish to publish.")


async def process_single_topic(topic: str, publish: bool = False):
    """Generate and optionally publish a post from a single topic."""
    logger.info(f"Generating post for topic: {topic}")

    post_text = generate_post(topic=topic)
    logger.info(f"\nGenerated post:\n{post_text}\n")

    image_path = generate_post_image(post_text)
    logger.info(f"Image saved to: {image_path}")

    if publish:
        result = await send_post(text=post_text, image_path=image_path)
        if result["success"]:
            logger.info(f"Published! Message ID: {result['message_id']}")
        else:
            logger.error(f"Failed to publish: {result['error']}")


def main():
    parser = argparse.ArgumentParser(description="ClaudeSafe - AI Post Generator")
    subparsers = parser.add_subparsers(dest="command")

    # alerts command
    alerts_parser = subparsers.add_parser("alerts", help="Process Google Alerts")
    alerts_parser.add_argument("--max", type=int, default=3, help="Max alerts to process")
    alerts_parser.add_argument("--publish", action="store_true", help="Publish to Telegram")

    # post command
    post_parser = subparsers.add_parser("post", help="Generate a post from a topic")
    post_parser.add_argument("topic", help="Post topic/idea")
    post_parser.add_argument("--publish", action="store_true", help="Publish to Telegram")

    # bot command
    subparsers.add_parser("bot", help="Start interactive Telegram bot")

    args = parser.parse_args()

    if args.command == "alerts":
        asyncio.run(process_alerts(max_alerts=args.max, auto_publish=args.publish))
    elif args.command == "post":
        asyncio.run(process_single_topic(topic=args.topic, publish=args.publish))
    elif args.command == "bot":
        from interactive_bot import main as bot_main
        bot_main()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
