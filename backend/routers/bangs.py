from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.engine import get_db
from repositories.bang_repository import BangRepository
from schemas.bang import BangCreate, BangUpdate, BangResponse

router = APIRouter(prefix="/api/bangs", tags=["bangs"])


def get_repo(db: Session = Depends(get_db)) -> BangRepository:
    """Dependency that provides a BangRepository instance."""
    return BangRepository(db)


@router.get("/", response_model=list[BangResponse], summary="List all bangs")
def list_bangs(repo: BangRepository = Depends(get_repo)):
    """Return every bang in the database, sorted by alias."""
    return repo.get_all()


@router.post(
    "/",
    response_model=BangResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bang",
)
def create_bang(data: BangCreate, repo: BangRepository = Depends(get_repo)):
    """
    Create a new search bang.

    - **alias** must be unique (case-insensitive, stored lowercase).
    - **searchurl** should end in a query placeholder (e.g. `?q=`).
    """
    if repo.get_by_alias(data.alias):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A bang with alias '{data.alias}' already exists.",
        )
    return repo.create(data)


@router.put("/{alias}", response_model=BangResponse, summary="Update a bang")
def update_bang(
    alias: str,
    data: BangUpdate,
    repo: BangRepository = Depends(get_repo),
):
    """
    Partially update an existing bang by its alias.
    Only the fields provided in the request body are modified.
    """
    updated = repo.update(alias, data)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bang with alias '{alias}' not found.",
        )
    return updated


@router.delete(
    "/{alias}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a bang",
)
def delete_bang(alias: str, repo: BangRepository = Depends(get_repo)):
    """Delete a bang by its alias. Returns 204 No Content on success."""
    deleted = repo.delete(alias)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bang with alias '{alias}' not found.",
        )
