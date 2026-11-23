from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from tickets.models import Ticket

from .test_models import make_ticket

LIST_URL = "/api/tickets/"


def detail_url(ticket_id):
    return f"/api/tickets/{ticket_id}/"


class CreateTicketTests(APITestCase):
    def valid_payload(self, **overrides):
        payload = {
            "title": "Charged twice",
            "description": "I was billed two times this month.",
            "category": "billing",
            "priority": "high",
        }
        payload.update(overrides)
        return payload

    def test_create_returns_201_and_defaults_status_to_open(self):
        response = self.client.post(LIST_URL, self.valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "open")
        self.assertIn("created_at", response.data)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_missing_title_returns_400(self):
        response = self.client.post(LIST_URL, self.valid_payload(title=""), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_title_over_200_characters_returns_400(self):
        response = self.client.post(LIST_URL, self.valid_payload(title="x" * 201), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_category_returns_400(self):
        response = self.client.post(
            LIST_URL, self.valid_payload(category="shipping"), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_client_cannot_set_created_at(self):
        response = self.client.post(
            LIST_URL, self.valid_payload(created_at="2000-01-01T00:00:00Z"), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.data["created_at"][:4], "2000")


class ListTicketTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.old = make_ticket(
            title="Invoice is wrong", description="Billed for the wrong plan.",
            category="billing", priority="medium",
        )
        cls.middle = make_ticket(
            title="App crashes", description="Crash when uploading a photo.",
            category="technical", priority="high", status="in_progress",
        )
        cls.new = make_ticket(
            title="Question", description="How do I export my invoice history?",
            category="general", priority="low",
        )
        # Spread creation times so ordering is unambiguous.
        now = timezone.now()
        Ticket.objects.filter(pk=cls.old.pk).update(created_at=now - timedelta(days=2))
        Ticket.objects.filter(pk=cls.middle.pk).update(created_at=now - timedelta(days=1))

    def ids(self, response):
        return [ticket["id"] for ticket in response.data]

    def test_lists_newest_first(self):
        response = self.client.get(LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.ids(response), [self.new.id, self.middle.id, self.old.id])

    def test_filter_by_category(self):
        response = self.client.get(LIST_URL, {"category": "billing"})
        self.assertEqual(self.ids(response), [self.old.id])

    def test_filter_by_priority(self):
        response = self.client.get(LIST_URL, {"priority": "high"})
        self.assertEqual(self.ids(response), [self.middle.id])

    def test_filter_by_status(self):
        response = self.client.get(LIST_URL, {"status": "open"})
        self.assertEqual(self.ids(response), [self.new.id, self.old.id])

    def test_search_matches_title_and_description(self):
        # "invoice" is in one title and in another ticket's description.
        response = self.client.get(LIST_URL, {"search": "invoice"})
        self.assertEqual(self.ids(response), [self.new.id, self.old.id])

    def test_search_is_case_insensitive(self):
        response = self.client.get(LIST_URL, {"search": "CRASH"})
        self.assertEqual(self.ids(response), [self.middle.id])

    def test_filters_and_search_combine(self):
        response = self.client.get(LIST_URL, {"search": "invoice", "category": "general"})
        self.assertEqual(self.ids(response), [self.new.id])

    def test_invalid_filter_value_returns_400(self):
        response = self.client.get(LIST_URL, {"priority": "urgent"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UpdateTicketTests(APITestCase):
    def setUp(self):
        self.ticket = make_ticket()

    def test_patch_status(self):
        response = self.client.patch(
            detail_url(self.ticket.id), {"status": "in_progress"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, "in_progress")

    def test_patch_overrides_category_and_priority(self):
        response = self.client.patch(
            detail_url(self.ticket.id),
            {"category": "technical", "priority": "critical"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.category, "technical")
        self.assertEqual(self.ticket.priority, "critical")

    def test_patch_invalid_status_returns_400(self):
        response = self.client.patch(
            detail_url(self.ticket.id), {"status": "pending"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_unknown_ticket_returns_404(self):
        response = self.client.patch(detail_url(99999), {"status": "closed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_is_not_allowed(self):
        response = self.client.put(detail_url(self.ticket.id), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
