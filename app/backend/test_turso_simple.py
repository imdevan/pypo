#!/usr/bin/env python3
"""
Simple Turso connection test using the turso CLI or direct HTTP.
"""

import os
import httpx
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_turso_with_http():
    """Test Turso connection using HTTP API."""
    database_url = os.getenv("TURSO_DATABASE_URL")
    auth_token = os.getenv("TURSO_AUTH_TOKEN")
    
    if not database_url or not auth_token:
        print("❌ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not set")
        return False
    
    # Convert libsql:// URL to HTTP
    if database_url.startswith("libsql://"):
        http_url = database_url.replace("libsql://", "https://") + "/v1/pipeline"
    else:
        print("❌ Invalid database URL format")
        return False
    
    print(f"Testing connection to: {http_url}")
    
    # Simple test query - Turso pipeline API format
    payload = {
        "requests": [
            {
                "type": "execute",
                "stmt": {
                    "sql": "SELECT 1 as test"
                }
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = httpx.post(http_url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Connection successful!")
            print(f"Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    success = test_turso_with_http()
    exit(0 if success else 1)