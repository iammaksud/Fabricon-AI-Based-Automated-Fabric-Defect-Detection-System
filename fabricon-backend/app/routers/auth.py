from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Admin
from app.schemas.auth_schema import AdminResponse, LoginRequest, TokenResponse
from app.services.auth_service import (
    authenticate_admin,
    create_access_token,
    get_current_admin,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


async def _extract_login_credentials(request: Request) -> LoginRequest:
    """Accepts login credentials from either of two request shapes and
    normalizes both into the same LoginRequest:

      - JSON body {"email": ..., "password": ...} -- what the React
        frontend sends.
      - application/x-www-form-urlencoded with 'username' and 'password'
        fields -- what Swagger UI's "Authorize" dialog sends, since
        OAuth2PasswordBearer(tokenUrl="/api/auth/login") in
        auth_service.py tells it to use the standard OAuth2 password
        flow. 'username' is treated as the admin's email, since email is
        this project's login identifier.

    Both branches raise the same RequestValidationError FastAPI itself
    would raise for a declared Body()/Form() parameter, so error
    responses stay in FastAPI's standard 422 shape either way.
    """
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        body = await request.json()
        try:
            return LoginRequest(**body)
        except ValidationError as exc:
            raise RequestValidationError(exc.errors()) from exc

    # Anything else (application/x-www-form-urlencoded or multipart/form-data)
    form = await request.form()
    try:
        return LoginRequest(email=form.get("username"), password=form.get("password"))
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin Login",
    description=(
        "Authenticates admin credentials and returns a JWT access token. "
        "Accepts a JSON body ({'email', 'password'} -- used by the React "
        "frontend) or application/x-www-form-urlencoded fields "
        "('username', 'password' -- sent by Swagger's Authorize dialog "
        "per the OAuth2 password flow)."
    ),
)
async def login(
    login_data: LoginRequest = Depends(_extract_login_credentials),
    db: Session = Depends(get_db),
):
    """Authenticates admin user and issues JWT bearer token."""
    admin = authenticate_admin(
        db, email=login_data.email, password=login_data.password
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated",
        )

    access_token = create_access_token(
        data={"sub": str(admin.id), "email": admin.email, "role": admin.role}
    )

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    response_model=AdminResponse,
    summary="Get Current Admin Profile",
    description="Returns profile information for the currently authenticated admin.",
)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    """Protected endpoint returning active admin profile."""
    return current_admin