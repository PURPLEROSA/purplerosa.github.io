"""
Gmail Reader for Google Alerts
Reads Google Alerts emails, extracts article titles, summaries, and source URLs.
"""

import base64
import re
from typing import Optional
from bs4 import BeautifulSoup
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

import config

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly",
           "https://www.googleapis.com/auth/gmail.modify"]


def get_gmail_service():
    """Authenticate and return a Gmail API service instance."""
    creds = None
    token_path = config.BASE_DIR / config.GMAIL_TOKEN_FILE
    creds_path = config.BASE_DIR / config.GMAIL_CREDENTIALS_FILE

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def extract_source_urls(html_body: str) -> list[dict]:
    """
    Extract source URLs from Google Alerts email HTML body.

    Google Alerts emails contain links wrapped in Google redirect URLs.
    This function extracts the actual destination URLs and their associated titles.

    Returns a list of dicts: [{"title": "...", "url": "..."}]
    """
    soup = BeautifulSoup(html_body, "html.parser")
    sources = []

    for link in soup.find_all("a", href=True):
        href = link["href"]
        title = link.get_text(strip=True)

        if not title or title.lower() in ("flag as irrelevant", "see more"):
            continue

        # Google Alerts wraps URLs like:
        # https://www.google.com/url?rct=j&sa=t&url=https://actual-site.com/article&...
        actual_url = _unwrap_google_url(href)

        if actual_url and _is_article_url(actual_url):
            sources.append({"title": title, "url": actual_url})

    return sources


def _unwrap_google_url(google_url: str) -> Optional[str]:
    """Extract the actual URL from a Google redirect URL."""
    # Pattern: https://www.google.com/url?...&url=ACTUAL_URL&...
    match = re.search(r"[?&]url=([^&]+)", google_url)
    if match:
        from urllib.parse import unquote
        return unquote(match.group(1))

    # If it's not a Google redirect, return the URL as-is if it looks valid
    if google_url.startswith("http") and "google.com/alerts" not in google_url:
        return google_url

    return None


def _is_article_url(url: str) -> bool:
    """Filter out non-article URLs (Google internal, mailto, etc.)."""
    skip_patterns = [
        "google.com/alerts",
        "accounts.google.com",
        "support.google.com",
        "mailto:",
        "javascript:",
    ]
    return not any(pattern in url for pattern in skip_patterns)


def get_alert_emails(max_results: int = 5) -> list[dict]:
    """
    Fetch recent Google Alerts emails and extract their content and source URLs.

    Returns a list of dicts:
    [
        {
            "subject": "Google Alert - AI",
            "snippet": "short preview...",
            "sources": [{"title": "Article Title", "url": "https://..."}],
            "body_text": "plain text body",
            "message_id": "msg_id"
        }
    ]
    """
    service = get_gmail_service()

    query = 'from:googlealerts-noreply@google.com'
    results = service.users().messages().list(
        userId="me", q=query, maxResults=max_results
    ).execute()

    messages = results.get("messages", [])
    alerts = []

    for msg_meta in messages:
        msg = service.users().messages().get(
            userId="me", id=msg_meta["id"], format="full"
        ).execute()

        subject = ""
        for header in msg["payload"].get("headers", []):
            if header["name"].lower() == "subject":
                subject = header["value"]
                break

        html_body, text_body = _extract_body(msg["payload"])
        sources = extract_source_urls(html_body) if html_body else []

        alerts.append({
            "subject": subject,
            "snippet": msg.get("snippet", ""),
            "sources": sources,
            "body_text": text_body or msg.get("snippet", ""),
            "message_id": msg_meta["id"],
        })

    return alerts


def _extract_body(payload: dict) -> tuple[str, str]:
    """Extract HTML and plain text body from email payload."""
    html_body = ""
    text_body = ""

    if "parts" in payload:
        for part in payload["parts"]:
            mime_type = part.get("mimeType", "")
            data = part.get("body", {}).get("data", "")

            if data:
                decoded = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
                if mime_type == "text/html":
                    html_body = decoded
                elif mime_type == "text/plain":
                    text_body = decoded

            # Handle nested multipart
            if "parts" in part:
                nested_html, nested_text = _extract_body(part)
                html_body = html_body or nested_html
                text_body = text_body or nested_text
    else:
        data = payload.get("body", {}).get("data", "")
        if data:
            decoded = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
            mime_type = payload.get("mimeType", "")
            if mime_type == "text/html":
                html_body = decoded
            else:
                text_body = decoded

    return html_body, text_body


if __name__ == "__main__":
    alerts = get_alert_emails(max_results=3)
    for alert in alerts:
        print(f"\n{'='*60}")
        print(f"Subject: {alert['subject']}")
        print(f"Sources found: {len(alert['sources'])}")
        for src in alert["sources"]:
            print(f"  - {src['title']}")
            print(f"    {src['url']}")
