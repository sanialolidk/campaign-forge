# Campaign Forge

An interactive digital marketing lab — learn the fundamentals and practice with real tools.

**[Live Demo](https://campaign-forge-nine.vercel.app)** · **[API Docs](https://campaign-forge-production-c44d.up.railway.app/docs)**

---

## What it does

**Learn tab** — 6 modules covering SEO, paid search, email marketing, social media, analytics, and marketing funnels. Mark modules complete and track your progress.

**Practice tab** — 3 real tools:
- **UTM Builder** — tag URLs to track traffic sources in analytics
- **A/B Test Calculator** — check if your test results are statistically significant
- **Budget Splitter** — allocate spend across channels using industry benchmarks

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| Auth | JWT tokens, bcrypt password hashing |
| Fonts | Plus Jakarta Sans, DM Sans |
| Infra | Railway (API + DB), Vercel (frontend) |

## Running locally

**API**
```bash
git clone https://github.com/sanialolidk/campaign-forge
cd campaign-forge
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env  # add your DATABASE_URL and SECRET_KEY
alembic upgrade head
PYTHONPATH=. python seed.py
uvicorn campaign_forge.api.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## API

Interactive docs at `/docs`. Core endpoints:

```
POST  /auth/register
POST  /auth/login
GET   /modules
GET   /modules/{slug}
POST  /modules/{slug}/complete
GET   /modules/progress/me
POST  /tools/utm
POST  /tools/abtest
POST  /tools/budget
```
