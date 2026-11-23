from django.db.models import Count, Min, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .llm import ClassificationError, classify_ticket
from .models import Ticket
from .serializers import ClassifyRequestSerializer, TicketSerializer


class TicketViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    POST   /api/tickets/           create a ticket (201)
    GET    /api/tickets/           list tickets, newest first, with filters + search
    PATCH  /api/tickets/<id>/      partially update a ticket
    GET    /api/tickets/stats/     aggregated statistics
    POST   /api/tickets/classify/  LLM-suggested category + priority
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filterset_fields = ["category", "priority", "status"]
    search_fields = ["title", "description"]
    # Only partial updates are exposed; PUT is intentionally not allowed.
    http_method_names = ["get", "post", "patch", "head", "options"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        # Every number is computed by PostgreSQL in a single aggregate query.
        # The dict comprehensions below only build SQL expressions from the
        # fixed choice lists; they never iterate over ticket rows.
        aggregates = Ticket.objects.aggregate(
            total_tickets=Count("id"),
            open_tickets=Count("id", filter=Q(status=Ticket.Status.OPEN)),
            first_created_at=Min("created_at"),
            **{
                f"priority_{value}": Count("id", filter=Q(priority=value))
                for value in Ticket.Priority.values
            },
            **{
                f"category_{value}": Count("id", filter=Q(category=value))
                for value in Ticket.Category.values
            },
        )

        total = aggregates["total_tickets"]
        first_created_at = aggregates["first_created_at"]
        if first_created_at:
            # Days from the first ticket up to today, inclusive.
            days = (timezone.localdate() - timezone.localdate(first_created_at)).days + 1
            avg_per_day = round(total / days, 1)
        else:
            avg_per_day = 0.0

        return Response(
            {
                "total_tickets": total,
                "open_tickets": aggregates["open_tickets"],
                "avg_tickets_per_day": avg_per_day,
                "priority_breakdown": {
                    value: aggregates[f"priority_{value}"] for value in Ticket.Priority.values
                },
                "category_breakdown": {
                    value: aggregates[f"category_{value}"] for value in Ticket.Category.values
                },
            }
        )

    @action(detail=False, methods=["post"])
    def classify(self, request):
        serializer = ClassifyRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            suggestion = classify_ticket(serializer.validated_data["description"])
        except ClassificationError as exc:
            # 503 tells the client suggestions are temporarily unavailable;
            # the frontend falls back to manual selection and submission still works.
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(suggestion)
