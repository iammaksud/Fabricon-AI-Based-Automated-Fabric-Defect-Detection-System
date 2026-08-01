"""
Security utilities — SKELETON ONLY.

Authentication logic (password hashing, JWT creation/verification, the
get_current_admin dependency) is intentionally NOT implemented in this
foundation pass. These signatures exist so other modules can reference
them later without changing import paths, but calling them now will
raise NotImplementedError.
"""


def hash_password(plain_password: str) -> str:
    """Will hash a plaintext password using passlib/bcrypt."""
    raise NotImplementedError("Password hashing will be implemented in the auth module.")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Will verify a plaintext password against its stored hash."""
    raise NotImplementedError("Password verification will be implemented in the auth module.")


def create_access_token(data: dict) -> str:
    """Will encode a JWT access token for an authenticated admin."""
    raise NotImplementedError("JWT creation will be implemented in the auth module.")


def decode_access_token(token: str) -> dict:
    """Will decode and validate a JWT access token."""
    raise NotImplementedError("JWT decoding will be implemented in the auth module.")


def get_current_admin():
    """Will be a FastAPI dependency that extracts and validates the admin
    from the Authorization header, for use in protected routes."""
    raise NotImplementedError("Admin auth dependency will be implemented in the auth module.")
