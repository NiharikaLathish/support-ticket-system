from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from tickets.models import Ticket

from .test_models import make_ticket

STATS_URL = "/api/tickets/stats/"


class StatsTests(APITestCase):
    def test_empty_database(self):
        response = self.client.get(STATS_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "total_tickets": 0,
                "open_tickets": 0,
                "avg_tickets_per_day": 0.0,
                "priority_breakdown": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                "category_breakdown": {"billing": 0, "technical": 0, "account": 0, "general": 0},
            },
        )

    def test_counts_and_breakdowns(self):
        make_ticket(category="billing", priority="high")
        make_ticket(category="billing", priority="low", status="resolved")
        make_ticket(category="technical", priority="critical", status="in_progress")
        make_ticket(category="account", priority="high")

        data = self.client.get(STATS_URL).data

        self.assertEqual(data["total_tickets"], 4)
        self.assertEqual(data["open_tickets"], 2)
        self.assertEqual(
            data["priority_breakdown"], {"low": 1, "medium": 0, "high": 2, "critical": 1}
        )
        self.assertEqual(
            data["category_breakdown"], {"billing": 2, "technical": 1, "account": 1, "general": 0}
        )

    def test_avg_tickets_per_day_spans_first_ticket_to_today(self):
        first = make_ticket()
        make_ticket()
        # First ticket 3 days ago -> 4 days inclusive -> 2 tickets / 4 days.
        Ticket.objects.filter(pk=first.pk).update(created_at=timezone.now() - timedelta(days=3))

        data = self.client.get(STATS_URL).data

        self.assertEqual(data["avg_tickets_per_day"], 0.5)

    def test_uses_a_single_database_query(self):
        make_ticket()
        make_ticket(category="technical")

        with self.assertNumQueries(1):
            self.client.get(STATS_URL)
