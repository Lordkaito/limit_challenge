from django.db.models import Count, OuterRef, Prefetch, Subquery
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from submissions import models, serializers
from submissions.filters.submission import SubmissionFilterSet
from submissions.pagination import SubmissionPagination


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    filterset_class = SubmissionFilterSet
    pagination_class = SubmissionPagination
    filter_backends = [
        *viewsets.ReadOnlyModelViewSet.filter_backends,
        OrderingFilter,
    ]
    ordering_fields = ["created_at", "status", "priority"]
    ordering = ["-created_at", "-id"]

    def get_queryset(self):
        base_qs = models.Submission.objects.select_related(
            "broker", "company", "owner"
        )

        if self.action == "list":
            latest_note_qs = models.Note.objects.filter(
                submission=OuterRef("pk")
            ).order_by("-created_at")
            return base_qs.annotate(
                document_count=Count("documents", distinct=True),
                note_count=Count("notes", distinct=True),
                latest_note_author=Subquery(
                    latest_note_qs.values("author_name")[:1]
                ),
                latest_note_body=Subquery(latest_note_qs.values("body")[:1]),
                latest_note_created_at=Subquery(
                    latest_note_qs.values("created_at")[:1]
                ),
            )

        return base_qs.prefetch_related(
            Prefetch(
                "contacts",
                queryset=models.Contact.objects.order_by("name"),
            ),
            Prefetch(
                "documents",
                queryset=models.Document.objects.order_by("-uploaded_at"),
            ),
            Prefetch(
                "notes",
                queryset=models.Note.objects.order_by("-created_at"),
            ),
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return serializers.SubmissionDetailSerializer
        return serializers.SubmissionListSerializer


class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Broker.objects.all().order_by("name")
    serializer_class = serializers.BrokerSerializer
    pagination_class = None
