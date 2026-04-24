from django.db.models import Count, OuterRef, Subquery
from django.test import TestCase

from submissions.models import (
    Broker,
    Company,
    Contact,
    Document,
    Note,
    Submission,
    TeamMember,
)
from submissions.serializers import SubmissionDetailSerializer, SubmissionListSerializer


def _annotated(pk):
    """Return a Submission annotated with counts and latest-note subqueries."""
    latest_note_qs = Note.objects.filter(submission=OuterRef("pk")).order_by("-created_at")
    return (
        Submission.objects.annotate(
            document_count=Count("documents", distinct=True),
            note_count=Count("notes", distinct=True),
            latest_note_author=Subquery(latest_note_qs.values("author_name")[:1]),
            latest_note_body=Subquery(latest_note_qs.values("body")[:1]),
            latest_note_created_at=Subquery(latest_note_qs.values("created_at")[:1]),
        )
        .get(pk=pk)
    )


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

    def test_latest_note_present_when_note_exists(self):
        Note.objects.create(submission=self.sub, author_name="Alice", body="Short note")
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertIsNotNone(data["latest_note"])
        self.assertEqual(data["latest_note"]["author_name"], "Alice")
        self.assertEqual(data["latest_note"]["body_preview"], "Short note")

    def test_body_preview_truncated_to_200_chars(self):
        long_body = "x" * 300
        Note.objects.create(submission=self.sub, author_name="Bob", body=long_body)
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertEqual(len(data["latest_note"]["body_preview"]), 200)

    def test_latest_note_none_when_body_is_empty(self):
        # A note with an empty body should still return null for latest_note
        Note.objects.create(submission=self.sub, author_name="Bob", body="")
        sub = _annotated(self.sub.pk)
        data = SubmissionListSerializer(sub).data
        self.assertIsNone(data["latest_note"])


class SubmissionDetailSerializerTests(TestCase):
    def setUp(self):
        self.broker = Broker.objects.create(
            name="BrokerX", primary_contact_email="x@x.com"
        )
        self.company = Company.objects.create(
            legal_name="CompanyX", industry="Finance", headquarters_city="Chicago"
        )
        self.owner = TeamMember.objects.create(full_name="Owner X", email="ox@ox.com")
        self.sub = Submission.objects.create(
            broker=self.broker,
            company=self.company,
            owner=self.owner,
            status="in_review",
            priority="medium",
            summary="Detail test submission",
        )

    def _serialized(self):
        sub = Submission.objects.prefetch_related(
            "contacts", "documents", "notes"
        ).get(pk=self.sub.pk)
        return SubmissionDetailSerializer(sub).data

    def test_detail_has_contacts_documents_notes_fields(self):
        data = self._serialized()
        for field in ["contacts", "documents", "notes"]:
            self.assertIn(field, data)

    def test_contacts_is_empty_list_when_none(self):
        data = self._serialized()
        self.assertEqual(data["contacts"], [])

    def test_contacts_includes_all_fields(self):
        Contact.objects.create(
            submission=self.sub, name="Dana", role="CFO", email="d@d.com", phone="123"
        )
        data = self._serialized()
        self.assertEqual(len(data["contacts"]), 1)
        contact = data["contacts"][0]
        for field in ["id", "name", "role", "email", "phone"]:
            self.assertIn(field, contact)

    def test_documents_is_empty_list_when_none(self):
        data = self._serialized()
        self.assertEqual(data["documents"], [])

    def test_documents_includes_all_fields(self):
        Document.objects.create(
            submission=self.sub,
            title="Report",
            doc_type="pdf",
            file_url="http://x.com/r.pdf",
        )
        data = self._serialized()
        self.assertEqual(len(data["documents"]), 1)
        doc = data["documents"][0]
        for field in ["id", "title", "doc_type", "uploaded_at", "file_url"]:
            self.assertIn(field, doc)

    def test_notes_is_empty_list_when_none(self):
        data = self._serialized()
        self.assertEqual(data["notes"], [])

    def test_notes_includes_all_fields(self):
        Note.objects.create(submission=self.sub, author_name="Eva", body="Good work")
        data = self._serialized()
        self.assertEqual(len(data["notes"]), 1)
        note = data["notes"][0]
        for field in ["id", "author_name", "body", "created_at"]:
            self.assertIn(field, note)
