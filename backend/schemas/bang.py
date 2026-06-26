from pydantic import BaseModel, HttpUrl, field_validator


class BangBase(BaseModel):
    """Shared fields for all bang schemas."""

    name: str
    alias: str
    searchurl: str
    baseurl: str

    @field_validator("alias")
    @classmethod
    def alias_must_be_lowercase(cls, v: str) -> str:
        return v.strip().lower()


class BangCreate(BangBase):
    """Schema for creating a new bang."""
    pass


class BangUpdate(BaseModel):
    """Schema for updating an existing bang — all fields optional."""

    alias: str | None = None
    name: str | None = None
    searchurl: str | None = None
    baseurl: str | None = None

    @field_validator("alias")
    @classmethod
    def alias_must_be_lowercase(cls, v: str | None) -> str | None:
        if v is not None:
            return v.strip().lower()
        return v


class BangResponse(BangBase):
    """Schema returned in API responses."""

    model_config = {"from_attributes": True}
