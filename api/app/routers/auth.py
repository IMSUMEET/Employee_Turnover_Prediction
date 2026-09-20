"""Registration & login."""

from fastapi import APIRouter, HTTPException, status

from ..database import create_user, get_db, get_user
from ..schemas import Credentials, Token
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(creds: Credentials):
    with get_db() as conn:
        if get_user(conn, creds.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That username is already taken",
            )
        create_user(conn, creds.username, hash_password(creds.password))
    return Token(
        access_token=create_access_token(creds.username), username=creds.username
    )


@router.post("/login", response_model=Token)
def login(creds: Credentials):
    with get_db() as conn:
        user = get_user(conn, creds.username)
    if not user or not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return Token(
        access_token=create_access_token(creds.username), username=creds.username
    )
