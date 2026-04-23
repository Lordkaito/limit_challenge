from django.core.management.base import BaseCommand

from submissions import models


E2E_DATA = {
    "brokers": [
        {"name": "Alpha Brokers", "primary_contact_email": "alpha@brokers.test"},
        {"name": "Beta Brokers", "primary_contact_email": "beta@brokers.test"},
    ],
    "companies": [
        {"legal_name": "Acme Corp", "industry": "Technology", "headquarters_city": "Austin"},
        {"legal_name": "Globex Inc", "industry": "Finance", "headquarters_city": "New York"},
        {"legal_name": "Initech LLC", "industry": "Manufacturing", "headquarters_city": "Dallas"},
    ],
    "owners": [
        {"full_name": "Alice Owner", "email": "alice@ops.test"},
        {"full_name": "Bob Owner", "email": "bob@ops.test"},
    ],
    "submissions": [
        {
            "company_idx": 0,
            "broker_idx": 0,
            "owner_idx": 0,
            "status": "new",
            "priority": "high",
            "summary": "Acme Corp is seeking coverage for their new product line. High urgency.",
            "contacts": [
                {"name": "Carol Contact", "role": "CFO", "email": "carol@acme.test", "phone": "555-0001"},
            ],
            "documents": [
                {"title": "Acme Summary Report", "doc_type": "Summary", "file_url": "https://example.com/acme-summary.pdf"},
            ],
            "notes": [
                {"author_name": "Alice Owner", "body": "Initial review looks promising."},
            ],
        },
        {
            "company_idx": 1,
            "broker_idx": 1,
            "owner_idx": 1,
            "status": "in_review",
            "priority": "medium",
            "summary": "Globex Inc standard renewal submission. All docs in order.",
            "contacts": [
                {"name": "Dave Contact", "role": "CEO", "email": "dave@globex.test", "phone": "555-0002"},
                {"name": "Eve Contact", "role": "COO", "email": "eve@globex.test", "phone": "555-0003"},
            ],
            "documents": [
                {"title": "Globex Financials", "doc_type": "Spreadsheet", "file_url": "https://example.com/globex-fin.xlsx"},
                {"title": "Globex Presentation", "doc_type": "Presentation", "file_url": "https://example.com/globex-pres.pptx"},
            ],
            "notes": [
                {"author_name": "Bob Owner", "body": "Waiting on updated financials from broker."},
                {"author_name": "Bob Owner", "body": "Financials received. Moving to in-review."},
            ],
        },
        {
            "company_idx": 2,
            "broker_idx": 0,
            "owner_idx": 0,
            "status": "closed",
            "priority": "low",
            "summary": "Initech LLC closed successfully after full review.",
            "contacts": [],
            "documents": [],
            "notes": [],
        },
    ],
}


class Command(BaseCommand):
    help = "Seed deterministic E2E test data (clears existing data first)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Clear and rebuild E2E test data",
        )

    def handle(self, *args, **options):
        if models.Submission.objects.exists() and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "Data exists; rerun with --force to rebuild E2E seed data."
                )
            )
            return

        self.stdout.write("Clearing existing data...")
        models.Note.objects.all().delete()
        models.Document.objects.all().delete()
        models.Contact.objects.all().delete()
        models.Submission.objects.all().delete()
        models.Broker.objects.all().delete()
        models.Company.objects.all().delete()
        models.TeamMember.objects.all().delete()

        brokers = [
            models.Broker.objects.create(**b) for b in E2E_DATA["brokers"]
        ]
        companies = [
            models.Company.objects.create(**c) for c in E2E_DATA["companies"]
        ]
        owners = [
            models.TeamMember.objects.create(**o) for o in E2E_DATA["owners"]
        ]

        for sub_data in E2E_DATA["submissions"]:
            submission = models.Submission.objects.create(
                company=companies[sub_data["company_idx"]],
                broker=brokers[sub_data["broker_idx"]],
                owner=owners[sub_data["owner_idx"]],
                status=sub_data["status"],
                priority=sub_data["priority"],
                summary=sub_data["summary"],
            )
            for c in sub_data["contacts"]:
                models.Contact.objects.create(submission=submission, **c)
            for d in sub_data["documents"]:
                models.Document.objects.create(submission=submission, **d)
            for n in sub_data["notes"]:
                models.Note.objects.create(submission=submission, **n)

        self.stdout.write(
            self.style.SUCCESS(
                f"E2E seed data created: {len(E2E_DATA['submissions'])} submissions."
            )
        )
