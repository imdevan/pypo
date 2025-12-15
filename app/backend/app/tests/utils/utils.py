import random
import string

from fastapi.testclient import TestClient

from app.core.config import settings


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_password() -> str:
    """Generate a random password that meets all validation requirements:
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    - Minimum 8 characters
    """
    # Ensure we have at least one of each required character type
    uppercase = random.choice(string.ascii_uppercase)
    lowercase = random.choice(string.ascii_lowercase)
    digit = random.choice(string.digits)
    special = random.choice('!@#$%^&*(),.?":{}|<>')
    
    # Fill the rest with random characters (mix of all types)
    all_chars = string.ascii_letters + string.digits + '!@#$%^&*(),.?":{}|<>'
    remaining = "".join(random.choices(all_chars, k=4))  # 4 more chars to make it 8 total
    
    # Combine and shuffle
    password_chars = list(uppercase + lowercase + digit + special + remaining)
    random.shuffle(password_chars)
    return "".join(password_chars)


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def get_superuser_token_headers(client: TestClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
