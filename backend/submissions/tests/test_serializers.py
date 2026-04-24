from django.db.models import Count
from django.test import TestCase

from submissions.models import Broker, Company, Note, Submission, TeamMember
from submissions.serializers import SubmissionListSerializer


def _annotated(pk):
    """Return a Submission queryset annotated with document_count and note_count."""
    return Submission.objects.annotate(
        document_count=Count("documents", distinct=True),
        note_count=Count("notes", distinct=True),
    ).get(pk=pk)


class SubmissionListSerializerTests(TestCase):
    def setUp(self):
        self.broker = Broker.objects.create(
            name="B", primary_contact_email="b@b.com"
        )
        self.company = Company.objects.create(
            legal_name="C", industry="Tech", headquarters_city="NY"
        )
        self.owner = TeamMember.objects.create(full_name="Owner", email="o@o.com")
        self.sub = Submission.objects.create(
            broker=self.broker,
            company=self.company,
            owner=self.owner,
            status="new",
            priority="high",
        )

    def test_latest_note_none_when_no_notes(self):
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertIsNone(data["latest_note"])

    def test_document_count_defaults_to_zero(self):
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertEqual(data["document_count"], 0)

    def test_note_count_defaults_to_zero(self):
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertEqual(data["note_count"], 0)
