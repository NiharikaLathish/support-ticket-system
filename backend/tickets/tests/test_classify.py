"""
Classify endpoint tests. Gemini is mocked, so these run without an API key or
network access and cover the failure cases that are hard to trigger for real.
"""

import json
from unittest.mock import MagicMock, patch

import requests
from django.test import override_settings
from rest_framework.test import APITestCase

from tickets.models import Ticket

CLASSIFY_URL = "/api/tickets/classify/"
DESCRIPTION = {"description": "I cannot log in, the password reset email never arrives."}


def gemini_response(text):
    """Build a fake requests.Response shaped like Gemini's generateContent reply."""
    response = MagicMock()
    response.json.return_value = {"candidates": [{"content": {"parts": [{"text": text}]}}]}
    return response


@override_settings(GEMINI_API_KEY="test-key")
@patch("tickets.llm.requests.post")
class ClassifyTests(APITestCase):
    def test_returns_suggestion(self, mock_post):
        mock_post.return_value = gemini_response(
            json.dumps({"category": "account", "priority": "high"})
        )

        response = self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data, {"suggested_category": "account", "suggested_priority": "high"}
        )

    def test_sends_prompt_and_description_to_gemini(self, mock_post):
        mock_post.return_value = gemini_response('{"category": "account", "priority": "high"}')

        self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")

        payload = mock_post.call_args.kwargs["json"]
        self.assertIn("support ticket triage", payload["system_instruction"]["parts"][0]["text"])
        self.assertIn(DESCRIPTION["description"], payload["contents"][0]["parts"][0]["text"])
        self.assertEqual(mock_post.call_args.kwargs["headers"], {"x-goog-api-key": "test-key"})

    def test_normalizes_case_and_whitespace(self, mock_post):
        mock_post.return_value = gemini_response('{"category": " Account ", "priority": "HIGH"}')

        response = self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["suggested_category"], "account")
        self.assertEqual(response.data["suggested_priority"], "high")

    def test_missing_description_returns_400(self, mock_post):
        response = self.client.post(CLASSIFY_URL, {}, format="json")

        self.assertEqual(response.status_code, 400)
        mock_post.assert_not_called()

    def test_blank_description_returns_400(self, mock_post):
        response = self.client.post(CLASSIFY_URL, {"description": "   "}, format="json")

        self.assertEqual(response.status_code, 400)
        mock_post.assert_not_called()

    def assert_unavailable(self):
        with self.assertLogs("tickets.llm", level="WARNING"):
            response = self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertIn("detail", response.data)

    def test_timeout_returns_503(self, mock_post):
        mock_post.side_effect = requests.Timeout()
        self.assert_unavailable()

    def test_connection_error_returns_503(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        self.assert_unavailable()

    def test_http_error_returns_503(self, mock_post):
        response = gemini_response("")
        response.raise_for_status.side_effect = requests.HTTPError("500 Server Error")
        mock_post.return_value = response
        self.assert_unavailable()

    def test_non_json_output_returns_503(self, mock_post):
        mock_post.return_value = gemini_response("Sure! This looks like an account issue.")
        self.assert_unavailable()

    def test_unexpected_response_shape_returns_503(self, mock_post):
        response = MagicMock()
        response.json.return_value = {"candidates": []}
        mock_post.return_value = response
        self.assert_unavailable()

    def test_label_outside_choices_returns_503(self, mock_post):
        mock_post.return_value = gemini_response('{"category": "shipping", "priority": "high"}')
        self.assert_unavailable()

    def test_json_that_is_not_an_object_returns_503(self, mock_post):
        mock_post.return_value = gemini_response('["account", "high"]')

        response = self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")

        self.assertEqual(response.status_code, 503)

    @override_settings(GEMINI_API_KEY="")
    def test_missing_api_key_returns_503_without_calling_gemini(self, mock_post):
        response = self.client.post(CLASSIFY_URL, DESCRIPTION, format="json")

        self.assertEqual(response.status_code, 503)
        mock_post.assert_not_called()

    def test_ticket_creation_works_when_llm_is_down(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()

        response = self.client.post(
            "/api/tickets/",
            {"title": "Locked out", "category": "account", "priority": "high", **DESCRIPTION},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Ticket.objects.count(), 1)
        mock_post.assert_not_called()
