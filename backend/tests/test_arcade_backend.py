"""Backend tests for arcade scores & stats API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://play-simple-54.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

VALID_GAMES = ["tic-tac-toe", "snake", "memory", "2048"]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---- POST /api/scores valid ----
@pytest.mark.parametrize("game", VALID_GAMES)
def test_create_score_valid(session, game):
    payload = {"game": game, "nickname": f"TEST_{game}", "score": 42}
    r = session.post(f"{API}/scores", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["game"] == game
    assert data["nickname"] == f"TEST_{game}"
    assert data["score"] == 42
    assert "id" in data and isinstance(data["id"], str)
    assert "created_at" in data

    # verify persistence via GET
    r2 = session.get(f"{API}/scores/{game}?limit=50")
    assert r2.status_code == 200
    ids = [row["id"] for row in r2.json()]
    assert data["id"] in ids


# ---- POST /api/scores invalid ----
def test_create_invalid_game(session):
    r = session.post(f"{API}/scores", json={"game": "pacman", "nickname": "x", "score": 1})
    assert r.status_code == 422


def test_create_empty_nickname_defaults_anonim(session):
    r = session.post(f"{API}/scores", json={"game": "snake", "nickname": "   ", "score": 5})
    assert r.status_code == 200
    assert r.json()["nickname"] == "Anonim"


def test_create_negative_score_rejected(session):
    r = session.post(f"{API}/scores", json={"game": "snake", "nickname": "x", "score": -1})
    assert r.status_code == 422


def test_nickname_truncated_20(session):
    r = session.post(f"{API}/scores", json={"game": "snake", "nickname": "A" * 40, "score": 1})
    assert r.status_code == 200
    assert len(r.json()["nickname"]) == 20


# ---- GET /api/scores/{game} ----
def test_scores_sorted_desc_and_limit(session):
    game = "2048"
    # seed multiple
    seeded = [10, 500, 250, 999, 1]
    for s in seeded:
        session.post(f"{API}/scores", json={"game": game, "nickname": f"TEST_sort_{s}", "score": s})
    r = session.get(f"{API}/scores/{game}?limit=3")
    assert r.status_code == 200
    data = r.json()
    assert len(data) <= 3
    scores = [d["score"] for d in data]
    assert scores == sorted(scores, reverse=True)


def test_get_scores_invalid_game(session):
    r = session.get(f"{API}/scores/pacman")
    assert r.status_code == 400


# ---- GET /api/stats ----
def test_stats_structure(session):
    r = session.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    for g in VALID_GAMES:
        assert g in data
        assert "plays" in data[g]
        assert "top_score" in data[g]
        assert "top_player" in data[g]
        assert isinstance(data[g]["plays"], int)
