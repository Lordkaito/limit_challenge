import django_filters
from django.core.exceptions import ValidationError
from django.db.models import Exists, OuterRef, Q

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    priority = django_filters.CharFilter(field_name="priority", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker_id")
    companySearch = django_filters.CharFilter(method="filter_company_search")
    createdFrom = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__gte"
    )
    createdTo = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__lte"
    )
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = models.Submission
        fields = []

    def filter_company_search(self, qs, name, value):
        if not value:
            return qs
        return qs.filter(
            Q(company__legal_name__icontains=value)
            | Q(company__industry__icontains=value)
            | Q(company__headquarters_city__icontains=value)
        )

    def filter_has_documents(self, qs, name, value):
        exists = Exists(models.Document.objects.filter(submission=OuterRef("pk")))
        return qs.filter(exists) if value else qs.exclude(exists)

    def filter_has_notes(self, qs, name, value):
        exists = Exists(models.Note.objects.filter(submission=OuterRef("pk")))
        return qs.filter(exists) if value else qs.exclude(exists)

    def filter_search(self, qs, name, value):
        if not value:
            return qs
        return qs.filter(
            Q(company__legal_name__icontains=value)
            | Q(broker__name__icontains=value)
            | Q(summary__icontains=value)
        )

    def filter_queryset(self, queryset):
        created_from = self.form.cleaned_data.get("createdFrom")
        created_to = self.form.cleaned_data.get("createdTo")
        if created_from and created_to and created_from > created_to:
            raise ValidationError(
                {"createdFrom": "createdFrom must be before or equal to createdTo"}
            )
        return super().filter_queryset(queryset)
