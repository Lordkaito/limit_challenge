from django.test import TestCase
from rest_framework.test import APIClient

from submissions.models import (
    Broker,
    Company,
    Document,
    Note,
    Submission,
    TeamMember,
)


class FilterTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.broker_a = Broker.objects.create(
            name="Alpha Brokers", primary_contact_email="a@a.com"
        )
        cls.broker_b = Broker.objects.create(
            name="Beta Brokers", primary_contact_email="b@b.com"
        )
        cls.company_a = Company.objects.create(
            legal_name="Acme Corp", industry="Technology", headquarters_city="Austin"
        )
        cls.company_b = Company.objects.create(
            legal_name="Globex Inc", industry="Finance", headquarters_city="NYC"
        )
        cls.owner = TeamMember.objects.create(full_name="Owner", email="owner@test.com")

        cls.sub_new = Submission.objects.create(
            broker=cls.broker_a,
            company=cls.company_a,
            owner=cls.owner,
            status="new",
            priority="high",
            summary="Acme high priority submission",
        )
        cls.sub_review = Submission.objects.create(
            broker=cls.broker_b,
            company=cls.company_b,
            owner=cls.owner,
            status="in_review",
            priority="medium",
            summary="Globex routine renewal",
        )
        Document.objects.create(
            submission=cls.sub_new,
            title="Doc",
            doc_type="pdf",
            file_url="http://x.com/f.pdf",
        )
        Note.objects.create(
            submission=cls.sub_review, author_name="Bob", body="Note"
        )
        cls.client = APIClient()

    def results(self, **params):
        return self.client.get("/api/submissions/", params).json()["results"]

    def test_filter_by_status_new(self):
        res = self.results(status="new")
        self.assertTrue(all(r["status"] == "new" for r in res))
        self.assertEqual(len(res), 1)

    def test_filter_by_status_in_review(self):
        res = self.results(status="in_review")
        self.assertTrue(all(r["status"] == "in_review" for r in res))

    def test_filter_by_priority_high(self):
        res = self.results(priority="high")
        self.assertTrue(all(r["priority"] == "high" for r in res))
        self.assertEqual(len(res), 1)

    def test_filter_by_broker_id(self):
        res = self.results(brokerId=self.broker_a.pk)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["broker"]["name"], "Alpha Brokers")

    def test_filter_company_search_by_name(self):
        res = self.results(companySearch="acme")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["company"]["legalName"], "Acme Corp")

    def test_filter_company_search_by_industry(self):
        res = self.results(companySearch="Finance")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["company"]["legalName"], "Globex Inc")

    def test_filter_company_search_by_city(self):
        res = self.results(companySearch="Austin")
        self.assertEqual(len(res), 1)

    def test_filter_search_by_broker_name(self):
        res = self.results(search="Alpha")
        self.assertEqual(len(res), 1)

    def test_filter_search_by_summary(self):
        res = self.results(search="routine renewal")
        self.assertEqual(len(res), 1)

    def test_filter_has_documents_true(self):
        res = self.results(hasDocuments="true")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], self.sub_new.pk)

    def test_filter_has_documents_false(self):
        res = self.results(hasDocuments="false")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], self.sub_review.pk)

    def test_filter_has_notes_true(self):
        res = self.results(hasNotes="true")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], self.sub_review.pk)

    def test_filter_has_notes_false(self):
        res = self.results(hasNotes="false")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0]["id"], self.sub_new.pk)

    def test_combined_status_and_priority_filter(self):
        res = self.results(status="new", priority="high")
        self.assertEqual(len(res), 1)

    def test_combined_status_and_broker_filter(self):
        res = self.results(status="new", brokerId=self.broker_b.pk)
        self.assertEqual(len(res), 0)

    def test_date_range_invalid_returns_400(self):
        res = self.client.get(
            "/api/submissions/",
            {"createdFrom": "2025-12-31", "createdTo": "2025-01-01"},
        )
        self.assertEqual(res.status_code, 400)

    def test_pagination_total_pages_present(self):
        data = self.client.get("/api/submissions/").json()
        self.assertIn("totalPages", data)
        self.assertIsInstance(data["totalPages"], int)

    def test_page_size_param_respected(self):
        # Create 15 more submissions to exceed default page size
        for i in range(15):
            Submission.objects.create(
                broker=self.broker_a,
                company=self.company_a,
                owner=self.owner,
                status="new",
                priority="low",
            )
        data = self.client.get("/api/submissions/", {"pageSize": 5}).json()
        self.assertLessEqual(len(data["results"]), 5)
        self.assertGreater(data["totalPages"], 1)
