"""
Seed MongoDB with mock data derived from frontend/src/data/mockData.ts.

Run from the backend/ directory:
    python -m scripts.seed
    # or with a custom URI:
    MONGO_URI=mongodb://... python -m scripts.seed
"""

import hashlib
import logging
import os
import sys
from datetime import datetime, timezone

from bson import ObjectId
from pymongo import MongoClient, ASCENDING

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb://admin:secret@localhost:27017/hackathon?authSource=admin",
)
MONGO_DB = os.environ.get("MONGO_DB", "hackathon")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def oid(seed: str) -> ObjectId:
    """Deterministic ObjectId from a string seed — same seed always → same id."""
    hex24 = hashlib.md5(seed.encode()).hexdigest()[:24]
    return ObjectId(hex24)


def tier_from_level(level: str) -> tuple[int, str]:
    return {
        "bronze":  (1, "Bronze"),
        "silver":  (2, "Silver"),
        "gold":    (3, "Gold"),
        "diamond": (4, "Diamond"),
    }[level.lower()]


def tier_from_count(count: int) -> tuple[int, str]:
    if count >= 12:
        return (4, "Diamond")
    if count >= 8:
        return (3, "Gold")
    if count >= 4:
        return (2, "Silver")
    return (1, "Bronze")


NOW = datetime.now(timezone.utc)


# ─── Mock data (mirrored from mockData.ts) ───────────────────────────────────

_MOCK_USERS_RAW = [
    {
        "mock_id": "u1",
        "username": "murchy_dluffy",
        "name": "Murchy D.Luffy",
        "email": "marchydluffy@gmail.com",
        "avatar_url": "/avatar.png",
        "cover_image": "/cover-bg.png",
        "bio": "ฉันจะเป็นราชาโจรสลัดให้ได้เลย เหมียวโอ่ง เริดเลยหละ",
        "university": "King Mongkut's University of Technology Thonburi",
        "birth_date": "5 May 2005",
        "github": "github.com/marchydluffy",
        "linkedin": "th.linkedin.com/marchydluffy",
        "role_mastery": {"Developer": 8, "Business": 0, "UI/UX Designer": 0, "Marketing": 0, "AI / Data": 5, "Pitching": 1},
        "rank_overall": "Gold",
        "hard_skills": [
            {"name": "React",  "level": "gold",    "count": 8},
            {"name": "NextJS", "level": "gold",    "count": 7},
            {"name": "LLM",   "level": "diamond",  "count": 12},
            {"name": "Python", "level": "gold",    "count": 5},
        ],
        "behavioral_rates": 4.9,
    },
    {
        "mock_id": "u2",
        "username": "chanut_sunatho",
        "name": "Chanut Sunatho",
        "email": "chanut@example.com",
        "avatar_url": "https://i.pravatar.cc/150?u=1",
        "cover_image": "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=200&fit=crop",
        "bio": "UX designer who thinks in systems and communicates in pixels.",
        "university": "Chulalongkorn University",
        "birth_date": "10 Oct 2003",
        "github": None,
        "linkedin": None,
        "role_mastery": {"Developer": 0, "Business": 1, "UI/UX Designer": 10, "Marketing": 2, "AI / Data": 0, "Pitching": 5},
        "rank_overall": "Silver",
        "hard_skills": [
            {"name": "Figma",     "level": "gold",   "count": 10},
            {"name": "Prototype", "level": "silver", "count": 4},
            {"name": "Present",   "level": "gold",   "count": 5},
            {"name": "Wireframe", "level": "silver", "count": 3},
        ],
        "behavioral_rates": 4.5,
    },
    {
        "mock_id": "u3",
        "username": "somchai_jaidee",
        "name": "Somchai JaiDee",
        "email": "somchai@example.com",
        "avatar_url": "https://i.pravatar.cc/150?u=4",
        "cover_image": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop",
        "bio": "Business strategist passionate about startup ecosystems and growth hacking.",
        "university": "Kasetsart University",
        "birth_date": "1 Jan 2002",
        "github": None,
        "linkedin": None,
        "role_mastery": {"Developer": 0, "Business": 8, "UI/UX Designer": 1, "Marketing": 5, "AI / Data": 0, "Pitching": 3},
        "rank_overall": "Bronze",
        "hard_skills": [
            {"name": "Strategy", "level": "gold",   "count": 8},
            {"name": "Sales",    "level": "silver", "count": 5},
            {"name": "SEO",      "level": "bronze", "count": 3},
            {"name": "Market",   "level": "bronze", "count": 2},
        ],
        "behavioral_rates": 4.8,
    },
    {
        "mock_id": "u4",
        "username": "alice_wonderland",
        "name": "Alice Wonderland",
        "email": "alice@example.com",
        "avatar_url": "https://i.pravatar.cc/150?u=7",
        "cover_image": "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=200&fit=crop",
        "bio": "Backend engineer obsessed with distributed systems and clean APIs.",
        "university": "Chiang Mai University",
        "birth_date": "12 Dec 2004",
        "github": None,
        "linkedin": None,
        "role_mastery": {"Developer": 15, "Business": 0, "UI/UX Designer": 0, "Marketing": 0, "AI / Data": 8, "Pitching": 0},
        "rank_overall": "Diamond",
        "hard_skills": [
            {"name": "API",   "level": "diamond", "count": 15},
            {"name": "DB",    "level": "gold",    "count": 10},
            {"name": "Vision","level": "gold",    "count": 8},
            {"name": "Cloud", "level": "gold",    "count": 6},
        ],
        "behavioral_rates": 4.2,
    },
    {
        "mock_id": "u5",
        "username": "patchara_moonthong",
        "name": "Patchara Moonthong",
        "email": "patchara@example.com",
        "avatar_url": "https://i.pravatar.cc/150?u=13",
        "cover_image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop",
        "bio": "I turn ideas into compelling stories. Public speaker & pitch coach.",
        "university": "Thammasat University",
        "birth_date": "3 Mar 2003",
        "github": None,
        "linkedin": None,
        "role_mastery": {"Developer": 0, "Business": 2, "UI/UX Designer": 0, "Marketing": 6, "AI / Data": 0, "Pitching": 9},
        "rank_overall": "Gold",
        "hard_skills": [
            {"name": "Present", "level": "diamond", "count": 9},
            {"name": "Story",   "level": "gold",    "count": 7},
            {"name": "Brand",   "level": "gold",    "count": 5},
            {"name": "Ads",     "level": "silver",  "count": 4},
        ],
        "behavioral_rates": 4.7,
    },
    {
        "mock_id": "u6",
        "username": "natnicha_lertkul",
        "name": "Natnicha Lertkul",
        "email": "natnicha@example.com",
        "avatar_url": "https://i.pravatar.cc/150?u=16",
        "cover_image": "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=600&h=200&fit=crop",
        "bio": "Full-stack developer with a love for AI-powered products.",
        "university": "Mahidol University",
        "birth_date": "22 Jul 2004",
        "github": None,
        "linkedin": None,
        "role_mastery": {"Developer": 7, "Business": 0, "UI/UX Designer": 1, "Marketing": 0, "AI / Data": 6, "Pitching": 0},
        "rank_overall": "Gold",
        "hard_skills": [
            {"name": "React",  "level": "gold",   "count": 7},
            {"name": "Python", "level": "gold",   "count": 6},
            {"name": "NLP",    "level": "gold",   "count": 5},
            {"name": "DB",     "level": "silver", "count": 4},
        ],
        "behavioral_rates": 4.4,
    },
]

_MOCK_TEAMS_RAW = [
    {
        "mock_id": "t1",
        "title": "Pirate Hackathon",
        "leader_mock_id": "u1",
        "start_date": "2026-05-18",
        "end_date": "2026-05-24",
        "days_left": 3,
        "status": "IN_PROGRESS",
        "required_roles": ["Developer", "Pitching"],
        "required_skills": ["React", "API", "DB", "Story"],
        "member_mock_ids": ["u1", "u3", "u2"],
        "max_members": 4,
        "description": "We are building an AI-powered matchmaking platform for hackathons. Looking for a passionate developer and a strong presenter to complete our crew.",
    },
    {
        "mock_id": "t2",
        "title": "The Storytellers",
        "leader_mock_id": "u5",
        "start_date": "2026-05-25",
        "end_date": "2026-06-08",
        "days_left": 18,
        "status": "WAITING",
        "required_roles": ["Pitching", "UI/UX Designer"],
        "required_skills": ["Present", "Story", "Figma", "Visual"],
        "member_mock_ids": ["u5", "u2"],
        "max_members": 4,
        "description": "A team laser-focused on storytelling. Our goal is to create a pitch deck that moves judges to tears. Looking for a designer and co-presenter.",
    },
    {
        "mock_id": "t3",
        "title": "Data Kraken",
        "leader_mock_id": "u4",
        "start_date": "2026-05-19",
        "end_date": "2026-05-23",
        "days_left": 2,
        "status": "IN_PROGRESS",
        "required_roles": ["Business", "Marketing"],
        "required_skills": ["Python", "NLP", "Strategy", "Market"],
        "member_mock_ids": ["u4", "u6"],
        "max_members": 5,
        "description": "Deep-tech team building an NLP analytics engine. We have the technical muscle — now we need business and marketing talent to bring it to market.",
    },
    {
        "mock_id": "t4",
        "title": "GrowthLab",
        "leader_mock_id": "u3",
        "start_date": "2026-06-01",
        "end_date": "2026-06-15",
        "days_left": 25,
        "status": "WAITING",
        "required_roles": ["Developer", "UI/UX Designer"],
        "required_skills": ["SEO", "React", "Figma", "Brand"],
        "member_mock_ids": ["u3", "u5"],
        "max_members": 4,
        "description": "A growth-focused team combining marketing expertise with product craft. We need a frontend developer and a UX designer to ship fast.",
    },
    {
        "mock_id": "t5",
        "title": "AI สตาร์ทอัพ รุ่น 2",
        "leader_mock_id": "u6",
        "start_date": "2026-08-01",
        "end_date": "2026-08-03",
        "days_left": 74,
        "status": "WAITING",
        "required_roles": ["Business", "Pitching"],
        "required_skills": ["LLM", "Strategy", "Present"],
        "member_mock_ids": ["u1", "u6"],
        "max_members": 4,
        "description": "Next-generation AI startup competition. We have the tech — now seeking a business strategist and a compelling presenter to close the loop.",
    },
]


# ─── Builders ─────────────────────────────────────────────────────────────────

def build_user_doc(raw: dict) -> dict:
    role_list = []
    for role_name, count in raw["role_mastery"].items():
        if count == 0:
            continue
        tier, rank_title = tier_from_count(count)
        role_list.append({
            "name": role_name,
            "tier": tier,
            "project_count": count,
            "rank_title": rank_title,
        })

    skill_list = []
    for s in raw["hard_skills"]:
        tier, rank_title = tier_from_level(s["level"])
        skill_list.append({
            "name": s["name"],
            "tier": tier,
            "project_count": s["count"],
            "rank_title": rank_title,
        })

    return {
        "_id": oid(raw["mock_id"]),
        "username": raw["username"],
        "name": raw["name"],
        "email": raw["email"],
        "password_hash": None,
        "avatar_url": raw.get("avatar_url"),
        "cover_image": raw.get("cover_image"),
        "bio": raw.get("bio"),
        "university": raw.get("university"),
        "birth_date": raw.get("birth_date"),
        "github": raw.get("github"),
        "linkedin": raw.get("linkedin"),
        "mbti": None,
        "behavioral_rates": raw["behavioral_rates"],
        "rank_overall": raw["rank_overall"],
        "role": role_list,
        "skills": skill_list,
        "portfolios": [],
        "oauth_accounts": [],
        "created_at": NOW,
    }


def build_team_doc(raw: dict) -> dict:
    positions = [
        {"role": role, "filled": False, "invited_user_id": None}
        for role in raw["required_roles"]
    ]
    return {
        "_id": oid(raw["mock_id"]),
        "title": raw["title"],
        "leader_id": oid(raw["leader_mock_id"]),
        "status": raw["status"],
        "start_date": raw["start_date"],
        "end_date": raw["end_date"],
        "days_left": raw["days_left"],
        "required_roles": raw["required_roles"],
        "required_skills": raw["required_skills"],
        "positions": positions,
        "member_ids": [oid(mid) for mid in raw["member_mock_ids"]],
        "max_members": raw["max_members"],
        "description": raw.get("description"),
        "created_at": NOW,
    }


# ─── Index definitions ────────────────────────────────────────────────────────

USER_INDEXES = [
    {"keys": [("email", ASCENDING)],    "kwargs": {"unique": True}},
    {"keys": [("username", ASCENDING)], "kwargs": {"unique": True}},
    {"keys": [("skills.name", ASCENDING)], "kwargs": {}},
    {"keys": [("role.name", ASCENDING)],   "kwargs": {}},
]

TEAM_INDEXES = [
    {"keys": [("status", ASCENDING)],               "kwargs": {}},
    {"keys": [("required_roles", ASCENDING)],        "kwargs": {}},
    {"keys": [("required_skills", ASCENDING)],       "kwargs": {}},
    {"keys": [("leader_id", ASCENDING)],             "kwargs": {}},
]

VOTE_INDEXES = [
    {"keys": [("target_id", ASCENDING)],             "kwargs": {}},
    {"keys": [("team_id", ASCENDING), ("voter_id", ASCENDING), ("target_id", ASCENDING)],
     "kwargs": {"unique": True}},
]

NOTIF_INDEXES = [
    {"keys": [("user_id", ASCENDING), ("read", ASCENDING)], "kwargs": {}},
    {"keys": [("created_at", ASCENDING)], "kwargs": {}},
]

# All known skills from user profiles and team requirements
_SEED_SKILLS = sorted({
    # User hard skills
    "React", "NextJS", "LLM", "Python", "Figma", "Prototype", "Present",
    "Wireframe", "Strategy", "Sales", "SEO", "Market", "API", "DB",
    "Vision", "Cloud", "Story", "Brand", "Ads", "NLP",
    # Team required skills
    "Visual",
})

SKILL_CATALOG_INDEXES = [
    {"keys": [("name", ASCENDING)], "kwargs": {"unique": True}},
]


# ─── Main ─────────────────────────────────────────────────────────────────────

def seed() -> None:
    client: MongoClient = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5_000)
    db = client[MONGO_DB]

    log.info("Connected to MongoDB — db: %s", MONGO_DB)

    # ── users ──
    users_col = db["users"]
    users_col.drop()
    user_docs = [build_user_doc(r) for r in _MOCK_USERS_RAW]
    users_col.insert_many(user_docs)
    for idx in USER_INDEXES:
        users_col.create_index(idx["keys"], **idx["kwargs"])
    log.info("✅  users — inserted %d documents, %d indexes", len(user_docs), len(USER_INDEXES))

    # ── teams ──
    teams_col = db["teams"]
    teams_col.drop()
    team_docs = [build_team_doc(r) for r in _MOCK_TEAMS_RAW]
    teams_col.insert_many(team_docs)
    for idx in TEAM_INDEXES:
        teams_col.create_index(idx["keys"], **idx["kwargs"])
    log.info("✅  teams — inserted %d documents, %d indexes", len(team_docs), len(TEAM_INDEXES))

    # ── skill_catalog ──
    skill_col = db["skill_catalog"]
    skill_col.drop()
    skill_col.insert_many([{"name": s, "created_at": NOW} for s in _SEED_SKILLS])
    for idx in SKILL_CATALOG_INDEXES:
        skill_col.create_index(idx["keys"], **idx["kwargs"])
    log.info("✅  skill_catalog — inserted %d documents, %d indexes", len(_SEED_SKILLS), len(SKILL_CATALOG_INDEXES))

    # ── behavioral_votes (empty, indexes only) ──
    votes_col = db["behavioral_votes"]
    votes_col.drop()
    for idx in VOTE_INDEXES:
        votes_col.create_index(idx["keys"], **idx["kwargs"])
    log.info("✅  behavioral_votes — empty collection, %d indexes", len(VOTE_INDEXES))

    # ── notifications (empty, indexes only) ──
    notif_col = db["notifications"]
    notif_col.drop()
    for idx in NOTIF_INDEXES:
        notif_col.create_index(idx["keys"], **idx["kwargs"])
    log.info("✅  notifications — empty collection, %d indexes", len(NOTIF_INDEXES))

    client.close()
    log.info("Seed complete.")

    # Print the mock_id → ObjectId mapping for reference
    log.info("\nID mapping (use these in development):")
    for r in _MOCK_USERS_RAW:
        log.info("  %s → %s  (%s)", r["mock_id"], oid(r["mock_id"]), r["username"])
    for r in _MOCK_TEAMS_RAW:
        log.info("  %s → %s  (%s)", r["mock_id"], oid(r["mock_id"]), r["title"])


if __name__ == "__main__":
    seed()
