.PHONY: setup dev-backend dev-frontend test-backend test-frontend seed

setup:
	cp .env.example .env
	cd backend && pip install -r requirements.txt
	cd backend && python manage.py migrate
	cd backend && python manage.py seed_submissions
	cd frontend && npm install

dev-backend:
	cd backend && python manage.py runserver 0.0.0.0:8000

dev-frontend:
	cd frontend && npm run dev

test-backend:
	cd backend && python manage.py test submissions.tests -v 2

test-frontend:
	cd frontend && npm test -- --passWithNoTests

seed:
	cd backend && python manage.py seed_submissions --force

seed-e2e:
	cd backend && python manage.py seed_e2e_submissions --force
