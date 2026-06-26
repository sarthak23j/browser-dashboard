from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from database.base import Base


class Bang(Base):
    """ORM model representing a search bang shortcut."""

    __tablename__ = "bangs"

    alias: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    searchurl: Mapped[str] = mapped_column(String, nullable=False)
    baseurl: Mapped[str] = mapped_column(String, nullable=False)

    def __repr__(self) -> str:
        return f"<Bang alias={self.alias!r} name={self.name!r}>"
