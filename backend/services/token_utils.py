import jwt
from flask import request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY")

def generate_token(user_id, expires_in=24):
    """Generate a JWT token with user ID and expiration."""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=expires_in)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token):
    """Decode a JWT token and return the payload."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def require_auth(f):
    """Decorator to enforce token authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = token.split("Bearer ")[1]
        try:
            decoded = decode_token(token)
        except ValueError as e:
            return jsonify({"error": str(e)}), 401
        
        # Add decoded user ID to `kwargs`
        kwargs["user_id"] = decoded["user_id"]
        return f(*args, **kwargs)
    
    return decorated
