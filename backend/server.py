from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

VALID_GAMES = {"tic-tac-toe", "snake", "memory", "2048"}


class ScoreCreate(BaseModel):
    game: str
    nickname: str
    score: int
    meta: Optional[dict] = None

    @field_validator("game")
    @classmethod
    def valid_game(cls, v):
        if v not in VALID_GAMES:
            raise ValueError("joc invalid")
        return v

    @field_validator("nickname")
    @classmethod
    def clean_nickname(cls, v):
        v = (v or "").strip()
        if not v:
            v = "Anonim"
        return v[:20]

    @field_validator("score")
    @classmethod
    def valid_score(cls, v):
        if v < 0:
            raise ValueError("scor invalid")
        return v


class Score(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game: str
    nickname: str
    score: int
    meta: Optional[dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/")
async def root():
    return {"message": "Arcade API"}


@api_router.post("/scores", response_model=Score)
async def create_score(payload: ScoreCreate):
    score_obj = Score(**payload.model_dump())
    await db.scores.insert_one(score_obj.model_dump())
    return score_obj


@api_router.get("/scores/{game}", response_model=List[Score])
async def get_scores(game: str, limit: int = 10):
    if game not in VALID_GAMES:
        raise HTTPException(status_code=400, detail="joc invalid")
    docs = await db.scores.find({"game": game}, {"_id": 0}).sort("score", -1).to_list(limit)
    return docs


@api_router.get("/stats")
async def get_stats():
    stats = {}
    for game in VALID_GAMES:
        count = await db.scores.count_documents({"game": game})
        top = await db.scores.find({"game": game}, {"_id": 0}).sort("score", -1).to_list(1)
        stats[game] = {
            "plays": count,
            "top_score": top[0]["score"] if top else 0,
            "top_player": top[0]["nickname"] if top else None,
        }
    return stats


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
