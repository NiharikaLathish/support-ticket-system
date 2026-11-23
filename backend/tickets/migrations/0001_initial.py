from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Ticket",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("billing", "Billing"),
                            ("technical", "Technical"),
                            ("account", "Account"),
                            ("general", "General"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("low", "Low"),
                            ("medium", "Medium"),
                            ("high", "High"),
                            ("critical", "Critical"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("open", "Open"),
                            ("in_progress", "In progress"),
                            ("resolved", "Resolved"),
                            ("closed", "Closed"),
                        ],
                        db_default="open",
                        default="open",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "constraints": [
                    models.CheckConstraint(
                        condition=models.Q(
                            ("category__in", ["billing", "technical", "account", "general"])
                        ),
                        name="ticket_category_valid",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("priority__in", ["low", "medium", "high", "critical"])),
                        name="ticket_priority_valid",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(
                            ("status__in", ["open", "in_progress", "resolved", "closed"])
                        ),
                        name="ticket_status_valid",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("title", ""), _negated=True),
                        name="ticket_title_not_empty",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("description", ""), _negated=True),
                        name="ticket_description_not_empty",
                    ),
                ],
            },
        ),
    ]
