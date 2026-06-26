from sqlalchemy.orm import Session
from models.bang import Bang
from schemas.bang import BangCreate, BangUpdate


class BangRepository:
    """Data access layer for Bang records. All DB interactions live here."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all(self) -> list[Bang]:
        """Return all bangs ordered alphabetically by alias."""
        return self.db.query(Bang).order_by(Bang.alias).all()

    def get_by_alias(self, alias: str) -> Bang | None:
        """Return a single bang by its alias, or None if not found."""
        return self.db.query(Bang).filter(Bang.alias == alias.lower()).first()

    def create(self, data: BangCreate) -> Bang:
        """Persist a new bang and return the created record."""
        bang = Bang(
            alias=data.alias,
            name=data.name,
            searchurl=data.searchurl,
            baseurl=data.baseurl,
        )
        self.db.add(bang)
        self.db.commit()
        self.db.refresh(bang)
        return bang

    def update(self, alias: str, data: BangUpdate) -> Bang | None:
        """Apply partial updates to an existing bang. Returns None if not found."""
        bang = self.get_by_alias(alias)
        if bang is None:
            return None

        update_fields = data.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(bang, field, value)

        self.db.commit()
        self.db.refresh(bang)
        return bang

    def delete(self, alias: str) -> bool:
        """Delete a bang by alias. Returns True if deleted, False if not found."""
        bang = self.get_by_alias(alias)
        if bang is None:
            return False

        self.db.delete(bang)
        self.db.commit()
        return True

    def count(self) -> int:
        """Return the total number of bang records."""
        return self.db.query(Bang).count()

    def bulk_create(self, bangs: list[dict]) -> None:
        """Insert multiple bangs at once (used during seeding)."""
        self.db.bulk_insert_mappings(Bang, bangs)  # type: ignore[arg-type]
        self.db.commit()
