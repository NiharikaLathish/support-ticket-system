from django.db import models
from django.db.models import Q


class Ticket(models.Model):
    class Category(models.TextChoices):
        BILLING = "billing", "Billing"
        TECHNICAL = "technical", "Technical"
        ACCOUNT = "account", "Account"
        GENERAL = "general", "General"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    priority = models.CharField(max_length=20, choices=Priority.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_default=Status.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        # Django `choices` are only validated in Python; these CHECK constraints
        # make PostgreSQL reject invalid values even from raw SQL or bulk writes.
        constraints = [
            models.CheckConstraint(
                condition=Q(category__in=["billing", "technical", "account", "general"]),
                name="ticket_category_valid",
            ),
            models.CheckConstraint(
                condition=Q(priority__in=["low", "medium", "high", "critical"]),
                name="ticket_priority_valid",
            ),
            models.CheckConstraint(
                condition=Q(status__in=["open", "in_progress", "resolved", "closed"]),
                name="ticket_status_valid",
            ),
            models.CheckConstraint(condition=~Q(title=""), name="ticket_title_not_empty"),
            models.CheckConstraint(
                condition=~Q(description=""), name="ticket_description_not_empty"
            ),
        ]

    def __str__(self):
        return self.title
