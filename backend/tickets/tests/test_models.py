from django.db import IntegrityError, connection, transaction
from django.test import TestCase

from tickets.models import Ticket


def make_ticket(**overrides):
    fields = {
        "title": "Cannot log in",
        "description": "Password reset email never arrives.",
        "category": Ticket.Category.ACCOUNT,
        "priority": Ticket.Priority.HIGH,
    }
    fields.update(overrides)
    return Ticket.objects.create(**fields)


class TicketConstraintTests(TestCase):
    """These bypass Django validation to prove PostgreSQL enforces the rules."""

    def assert_rejected_by_db(self, **overrides):
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_ticket(**overrides)

    def test_invalid_category_rejected(self):
        self.assert_rejected_by_db(category="shipping")

    def test_invalid_priority_rejected(self):
        self.assert_rejected_by_db(priority="urgent")

    def test_invalid_status_rejected(self):
        self.assert_rejected_by_db(status="pending")

    def test_empty_title_rejected(self):
        self.assert_rejected_by_db(title="")

    def test_empty_description_rejected(self):
        self.assert_rejected_by_db(description="")

    def test_invalid_value_rejected_on_bulk_update(self):
        ticket = make_ticket()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Ticket.objects.filter(pk=ticket.pk).update(priority="urgent")

    def test_status_defaults_to_open(self):
        self.assertEqual(make_ticket().status, Ticket.Status.OPEN)

    def test_status_default_is_set_in_database(self):
        # Insert with raw SQL (no Django defaults) to check the DB-level default.
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tickets_ticket (title, description, category, priority, created_at) "
                "VALUES ('Raw', 'Inserted with SQL', 'general', 'low', NOW()) RETURNING status"
            )
            self.assertEqual(cursor.fetchone()[0], "open")
