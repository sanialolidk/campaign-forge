import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from campaign_forge.api.main import app
from campaign_forge.db import get_db, Base
from campaign_forge.api.auth import hash_password, create_token
from campaign_forge.models import User, Module


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        c._test_db = TestSession
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def auth_client(client):
    db = client._test_db()
    user = User(email="test@example.com", hashed_password=hash_password("testpass1234"))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id)
    db.close()
    client.headers["Authorization"] = f"Bearer {token}"
    return client


@pytest.fixture
def seeded_client(auth_client):
    db = auth_client._test_db()
    modules = [
        Module(slug="seo-basics", title="SEO Fundamentals", category="SEO", order=1, content="SEO content here."),
        Module(slug="paid-search", title="Paid Search (PPC)", category="Paid", order=2, content="PPC content here."),
        Module(slug="email-marketing", title="Email Marketing", category="Email", order=3, content="Email content here."),
    ]
    db.add_all(modules)
    db.commit()
    db.close()
    return auth_client


# ── health ────────────────────────────────────────────────────────────────────

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# ── auth: register ────────────────────────────────────────────────────────────

def test_register(client):
    r = client.post("/auth/register", json={"email": "new@example.com", "password": "pass1234"})
    assert r.status_code == 201
    assert "access_token" in r.json()
    assert r.json()["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "pass1234"}
    client.post("/auth/register", json=payload)
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 409


def test_register_short_password(client):
    r = client.post("/auth/register", json={"email": "x@example.com", "password": "short"})
    assert r.status_code == 422


def test_register_invalid_email(client):
    r = client.post("/auth/register", json={"email": "not-an-email", "password": "pass1234"})
    assert r.status_code == 422


# ── auth: login ───────────────────────────────────────────────────────────────

def test_login(client):
    client.post("/auth/register", json={"email": "login@example.com", "password": "pass1234"})
    r = client.post("/auth/login", json={"email": "login@example.com", "password": "pass1234"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "wp@example.com", "password": "correct1"})
    r = client.post("/auth/login", json={"email": "wp@example.com", "password": "wrongpass"})
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post("/auth/login", json={"email": "nobody@example.com", "password": "pass1234"})
    assert r.status_code == 401


# ── modules ───────────────────────────────────────────────────────────────────

def test_modules_require_auth(client):
    r = client.get("/modules")
    assert r.status_code == 401


def test_list_modules(seeded_client):
    r = seeded_client.get("/modules")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 3
    assert data[0]["slug"] == "seo-basics"
    assert data[1]["slug"] == "paid-search"


def test_list_modules_ordered(seeded_client):
    r = seeded_client.get("/modules")
    orders = [m["order"] for m in r.json()]
    assert orders == sorted(orders)


def test_get_module(seeded_client):
    r = seeded_client.get("/modules/seo-basics")
    assert r.status_code == 200
    data = r.json()
    assert data["slug"] == "seo-basics"
    assert data["title"] == "SEO Fundamentals"
    assert data["category"] == "SEO"
    assert "content" in data


def test_get_module_not_found(seeded_client):
    r = seeded_client.get("/modules/does-not-exist")
    assert r.status_code == 404


# ── progress ──────────────────────────────────────────────────────────────────

def test_my_progress_empty(seeded_client):
    r = seeded_client.get("/modules/progress/me")
    assert r.status_code == 200
    assert r.json() == []


def test_complete_module(seeded_client):
    r = seeded_client.post("/modules/seo-basics/complete")
    assert r.status_code == 201
    data = r.json()
    assert "completed_at" in data
    assert "module_id" in data


def test_complete_module_idempotent(seeded_client):
    seeded_client.post("/modules/seo-basics/complete")
    r = seeded_client.post("/modules/seo-basics/complete")
    assert r.status_code == 201
    progress = seeded_client.get("/modules/progress/me").json()
    assert len(progress) == 1


def test_complete_nonexistent_module(seeded_client):
    r = seeded_client.post("/modules/fake-module/complete")
    assert r.status_code == 404


def test_progress_shows_completed_modules(seeded_client):
    seeded_client.post("/modules/seo-basics/complete")
    seeded_client.post("/modules/paid-search/complete")
    r = seeded_client.get("/modules/progress/me")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_progress_isolated_between_users(client):
    db = client._test_db()
    mod = Module(slug="seo-basics", title="SEO", category="SEO", order=1, content="content")
    alice = User(email="alice@x.com", hashed_password=hash_password("password1"))
    bob = User(email="bob@x.com", hashed_password=hash_password("password1"))
    db.add_all([mod, alice, bob])
    db.commit()
    db.refresh(alice)
    db.refresh(bob)
    db.close()

    client.headers["Authorization"] = f"Bearer {create_token(alice.id)}"
    client.post("/modules/seo-basics/complete")

    client.headers["Authorization"] = f"Bearer {create_token(bob.id)}"
    r = client.get("/modules/progress/me")
    assert r.json() == []


# ── tools: utm builder ────────────────────────────────────────────────────────

def test_utm_builder(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "https://example.com",
        "source": "newsletter",
        "medium": "email",
        "campaign": "summer-sale",
    })
    assert r.status_code == 200
    data = r.json()
    assert "utm_source=newsletter" in data["utm_url"]
    assert "utm_medium=email" in data["utm_url"]
    assert "utm_campaign=summer-sale" in data["utm_url"]


def test_utm_builder_with_optional_fields(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "https://example.com/page",
        "source": "google",
        "medium": "cpc",
        "campaign": "brand",
        "term": "devtools",
        "content": "header-cta",
    })
    assert r.status_code == 200
    url = r.json()["utm_url"]
    assert "utm_term=devtools" in url
    assert "utm_content=header-cta" in url


def test_utm_builder_preserves_existing_query_params(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "https://example.com?ref=homepage",
        "source": "email",
        "medium": "newsletter",
        "campaign": "launch",
    })
    assert r.status_code == 200
    url = r.json()["utm_url"]
    assert "ref=homepage" in url
    assert "utm_source=email" in url


def test_utm_builder_handles_fragment(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "https://example.com/page#section",
        "source": "email",
        "medium": "newsletter",
        "campaign": "launch",
    })
    assert r.status_code == 200
    url = r.json()["utm_url"]
    assert url.index("utm_source") < url.index("#")


def test_utm_builder_invalid_url(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "not-a-url",
        "source": "email",
        "medium": "newsletter",
        "campaign": "launch",
    })
    assert r.status_code == 422


def test_utm_builder_empty_source(auth_client):
    r = auth_client.post("/tools/utm", json={
        "url": "https://example.com",
        "source": "",
        "medium": "email",
        "campaign": "launch",
    })
    assert r.status_code == 422


def test_utm_requires_auth(client):
    r = client.post("/tools/utm", json={
        "url": "https://example.com",
        "source": "email",
        "medium": "newsletter",
        "campaign": "launch",
    })
    assert r.status_code == 401


# ── tools: a/b test ───────────────────────────────────────────────────────────

def test_ab_test_b_wins(auth_client):
    r = auth_client.post("/tools/abtest", json={
        "visitors_a": 1000, "conversions_a": 50,
        "visitors_b": 1000, "conversions_b": 100,
    })
    assert r.status_code == 200
    data = r.json()
    assert data["winner"] == "B"
    assert data["rate_a"] == 5.0
    assert data["rate_b"] == 10.0
    assert data["relative_improvement"] == 100.0


def test_ab_test_not_significant(auth_client):
    r = auth_client.post("/tools/abtest", json={
        "visitors_a": 10, "conversions_a": 1,
        "visitors_b": 10, "conversions_b": 2,
    })
    assert r.status_code == 200
    assert r.json()["confidence"] == "Not significant"


def test_ab_test_tie(auth_client):
    r = auth_client.post("/tools/abtest", json={
        "visitors_a": 1000, "conversions_a": 50,
        "visitors_b": 1000, "conversions_b": 50,
    })
    assert r.status_code == 200
    assert r.json()["winner"] == "Tie"


def test_ab_test_conversions_exceed_visitors(auth_client):
    r = auth_client.post("/tools/abtest", json={
        "visitors_a": 100, "conversions_a": 200,
        "visitors_b": 100, "conversions_b": 50,
    })
    assert r.status_code == 422


def test_ab_test_requires_auth(client):
    r = client.post("/tools/abtest", json={
        "visitors_a": 1000, "conversions_a": 50,
        "visitors_b": 1000, "conversions_b": 60,
    })
    assert r.status_code == 401


# ── tools: budget splitter ────────────────────────────────────────────────────

def test_budget_splitter(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": 10000,
        "channels": ["SEO", "Email"],
    })
    assert r.status_code == 200
    data = r.json()
    assert "SEO" in data["allocations"]
    assert "Email" in data["allocations"]
    assert abs(sum(data["allocations"].values()) - 10000) < 0.01


def test_budget_splitter_known_weights(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": 1000,
        "channels": ["SEO", "Paid Search"],
    })
    assert r.status_code == 200
    allocs = r.json()["allocations"]
    assert allocs["SEO"] > allocs["Paid Search"]


def test_budget_splitter_empty_channels(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": 5000,
        "channels": [],
    })
    assert r.status_code == 422


def test_budget_splitter_negative_budget(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": -100,
        "channels": ["SEO"],
    })
    assert r.status_code == 422


def test_budget_splitter_zero_budget(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": 0,
        "channels": ["SEO"],
    })
    assert r.status_code == 422


def test_budget_splitter_unknown_channel_gets_default_weight(auth_client):
    r = auth_client.post("/tools/budget", json={
        "total_budget": 1000,
        "channels": ["SEO", "Unknown Channel"],
    })
    assert r.status_code == 200
    assert "Unknown Channel" in r.json()["allocations"]


def test_budget_splitter_requires_auth(client):
    r = client.post("/tools/budget", json={
        "total_budget": 5000,
        "channels": ["SEO"],
    })
    assert r.status_code == 401
