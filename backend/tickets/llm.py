"""
LLM-based ticket classification using the Google Gemini REST API.

Any failure (missing key, network error, timeout, bad HTTP status, malformed or
out-of-range output) is raised as ClassificationError, so callers have exactly
one exception to handle and ticket submission never depends on the LLM.
"""

import json
import logging

import requests
from django.conf import settings

from .models import Ticket
from .prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Long descriptions are truncated to keep latency and token usage bounded;
# the first few thousand characters are plenty to judge category and priority.
MAX_DESCRIPTION_CHARS = 4000

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "category": {"type": "STRING", "enum": list(Ticket.Category.values)},
        "priority": {"type": "STRING", "enum": list(Ticket.Priority.values)},
    },
    "required": ["category", "priority"],
}


class ClassificationError(Exception):
    """Raised when a suggestion could not be obtained from the LLM."""


def classify_ticket(description: str) -> dict:
    """Return {"suggested_category": ..., "suggested_priority": ...}."""
    if not settings.GEMINI_API_KEY:
        raise ClassificationError("LLM API key is not configured.")

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": build_user_prompt(description[:MAX_DESCRIPTION_CHARS])}],
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA,
        },
    }

    try:
        response = requests.post(
            GEMINI_URL.format(model=settings.GEMINI_MODEL),
            headers={"x-goog-api-key": settings.GEMINI_API_KEY},
            json=payload,
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text)
    except requests.RequestException as exc:
        logger.warning("LLM request failed: %s", exc)
        raise ClassificationError("LLM service is unreachable.") from exc
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        logger.warning("LLM returned an unexpected response: %s", exc)
        raise ClassificationError("LLM returned an invalid response.") from exc

    return _validate(result)


def _validate(result) -> dict:
    """Accept only labels that exist in our model choices."""
    if not isinstance(result, dict):
        raise ClassificationError("LLM returned an invalid response.")

    category = str(result.get("category", "")).strip().lower()
    priority = str(result.get("priority", "")).strip().lower()

    if category not in Ticket.Category.values or priority not in Ticket.Priority.values:
        logger.warning("LLM returned labels outside the allowed choices: %r", result)
        raise ClassificationError("LLM returned an invalid response.")

    return {"suggested_category": category, "suggested_priority": priority}
