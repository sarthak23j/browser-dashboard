"""
Seed the database with the default set of bangs on first startup.

This runs automatically in main.py during the lifespan startup event.
It is a no-op if the table already contains data.
"""

from sqlalchemy.orm import Session
from repositories.bang_repository import BangRepository

# Default bangs — mirrors src/assets/bangs.json
DEFAULT_BANGS: list[dict] = [
    {
        "alias": "y",
        "name": "Youtube",
        "searchurl": "https://www.youtube.com/results?search_query=",
        "baseurl": "https://www.youtube.com",
    },
    {
        "alias": "g",
        "name": "Github",
        "searchurl": "https://github.com/search?q=",
        "baseurl": "https://github.com",
    },
    {
        "alias": "t",
        "name": "Twitter",
        "searchurl": "https://twitter.com/search?q=",
        "baseurl": "https://twitter.com",
    },
]


def seed_bangs(db: Session) -> None:
    """Insert default bangs if the table is empty."""
    repo = BangRepository(db)
    if repo.count() == 0:
        print("[seed] Seeding default bangs...")
        repo.bulk_create(DEFAULT_BANGS)
        print(f"[seed] Inserted {len(DEFAULT_BANGS)} default bangs.")
    else:
        print("[seed] Bangs table already populated — skipping seed.")
