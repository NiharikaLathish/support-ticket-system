from rest_framework import mixins, viewsets

from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    POST   /api/tickets/       create a ticket (201)
    GET    /api/tickets/       list tickets, newest first, with filters + search
    PATCH  /api/tickets/<id>/  partially update a ticket
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filterset_fields = ["category", "priority", "status"]
    search_fields = ["title", "description"]
    # Only partial updates are exposed; PUT is intentionally not allowed.
    http_method_names = ["get", "post", "patch", "head", "options"]
