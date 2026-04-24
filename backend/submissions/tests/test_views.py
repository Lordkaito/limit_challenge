from django.test import TestCase
from rest_framework.test import APIClient

from submissions.models import (
    Broker,
    Company,
    Contact,
    Document,
    Note,
    Submission,
    TeamMember,
)


def make_broker(name="Test Broker"):
    return Broker.objects.create(name=name, primary_contact_email="b@b.com")


def make_company(name="Acme Corp"):
    return Company.objects.create(
        legal_name=name, industry="Tech", headquarters_city="Austin"
    )


def make_owner(email="owner@test.com"):
    return TeamMember.objects.create(full_name="Alice", email=email)


def make_submission(broker=None, company=None, owner=None, **kwargs):
    return Submission.objects.create(
        broker=broker or make_broker(),
        company=company or make_company(),
        owner=owner or make_owner(),
        **kwargs,
    )


class SubmissionListViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.broker = make_broker()
        cls.company = make_company()
        cls.owner = make_owner()
        cls.submission = make_submission(
            broker=cls.broker,
            company=cls.company,
            owner=cls.owner,
            status="new",
            priority="high",
            summary="Test summary",
        )
        cls.client = APIClient()

    def get(self, params=None):
        return self.client.get("/api/submissions/", params or {})

    def test_list_returns_200(self):
        res = self.get()
        self.assertEqual(res.status_code, 200)

    def test_list_shape_has_pagination_fields(self):
        data = self.get().json()
        for field in ["count", "totalPages", "results", "next", "previous"]:
            self.assertIn(field, data)

    def test_list_item_has_required_fields(self):
        item = self.get().json()["results"][0]
        for field in [
            "id", "status", "priority", "summary",
            "broker", "company", "owner",
            "documentCount", "noteCount", "latestNote", "createdAt",
        ]:
            self.assertIn(field, item)

    def test_document_count_annotation(self):
        Document.objects.create(
            submission=self.submission,
            title="Doc",
            doc_type="pdf",
            file_url="http://example.com/f.pdf",
        )
        item = self.get().json()["results"][0]
        self.assertEqual(item["documentCount"], 1)

    def test_note_count_annotation(self):
        Note.objects.create(
            submission=self.submission, author_name="Bob", body="Note body"
        )
        item = self.get().json()["results"][0]
        self.assertEqual(item["noteCount"], 1)

    def test_latest_note_preview_present(self):
        Note.objects.create(
            submission=self.submission, author_name="Bob", body="Hello world"
        )
        note = self.get().json()["results"][0]["latestNote"]
        self.assertIsNotNone(note)
        self.assertEqual(note["authorName"], "Bob")
        self.assertIn("bodyPreview", note)

    def test_no_note_returns_null_latest_note(self):
        sub = make_submission(
            broker=make_broker("B2"),
            company=make_company("C2"),
            owner=make_owner("o2@test.com"),
        )
        res = self.get().json()
        item = next(r for r in res["results"] if r["id"] == sub.id)
        self.assertIsNone(item["latestNote"])

    def test_total_pages_is_integer(self):
        data = self.get().json()
        self.assertIsInstance(data["totalPages"], int)
        self.assertGreaterEqual(data["totalPages"], 1)

    def test_company_fields_camelcase(self):
        company = self.get().json()["results"][0]["company"]
        self.assertIn("legalName", company)
        self.assertIn("headquartersCity", company)

    def test_broker_fields_camelcase(self):
        broker = self.get().json()["results"][0]["broker"]
        self.assertIn("primaryContactEmail", broker)

    def test_owner_fields_camelcase(self):
        owner = self.get().json()["results"][0]["owner"]
        self.assertIn("fullName", owner)


class SubmissionDetailViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.broker = make_broker()
        cls.company = make_company()
        cls.owner = make_owner()
        cls.submission = make_submission(
            broker=cls.broker, company=cls.company, owner=cls.owner
        )
        cls.client = APIClient()

    def get(self, pk=None):
        return self.client.get(f"/api/submissions/{pk or self.submission.pk}/")

    def test_detail_returns_200(self):
        self.assertEqual(self.get().status_code, 200)

    def test_detail_returns_404_for_missing(self):
        self.assertEqual(self.client.get("/api/submissions/99999/").status_code, 404)

    def test_detail_has_contacts_documents_notes(self):
        data = self.get().json()
        for field in ["contacts", "documents", "notes"]:
            self.assertIn(field, data)

    def test_detail_contacts_are_list(self):
        Contact.objects.create(submission=self.submission, name="Zara")
        data = self.get().json()
        self.assertIsInstance(data["contacts"], list)
        self.assertEqual(len(data["contacts"]), 1)

    def test_detail_documents_ordered_newest_first(self):
        from datetime import timedelta
        from django.utils import timezone

        now = timezone.now()
        older = Document.objects.create(
            submission=self.submission,
            title="Older",
            doc_type="pdf",
            file_url="http://x.com/a",
        )
        newer = Document.objects.create(
            submission=self.submission,
            title="Newer",
            doc_type="pdf",
            file_url="http://x.com/b",
        )
        # Backdate the older document so ordering is deterministic
        Document.objects.filter(pk=older.pk).update(uploaded_at=now - timedelta(hours=2))
        Document.objects.filter(pk=newer.pk).update(uploaded_at=now)

        data = self.get().json()
        self.assertEqual(data["documents"][0]["title"], "Newer")

    def test_detail_notes_ordered_newest_first(self):
        from datetime import timedelta
        from django.utils import timezone

        now = timezone.now()
        first = Note.objects.create(
            submission=self.submission,
            author_name="A",
            body="first",
        )
        second = Note.objects.create(
            submission=self.submission,
            author_name="B",
            body="second",
        )
        # Backdate the older note so ordering is deterministic
        Note.objects.filter(pk=first.pk).update(created_at=now - timedelta(hours=1))
        Note.objects.filter(pk=second.pk).update(created_at=now)

        data = self.get().json()
        self.assertEqual(data["notes"][0]["body"], "second")


class BrokerListViewTests(TestCase):
    def test_broker_list_is_flat_array(self):
        make_broker("Alpha")
        res = APIClient().get("/api/brokers/")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_broker_list_ordered_by_name(self):
        make_broker("Zed")
        make_broker("Ant")
        data = APIClient().get("/api/brokers/").json()
        names = [b["name"] for b in data]
        self.assertEqual(names, sorted(names))

    def test_broker_list_not_paginated(self):
        data = APIClient().get("/api/brokers/").json()
        self.assertIsInstance(data, list)
        self.assertNotIn("results", data if isinstance(data, dict) else {})
