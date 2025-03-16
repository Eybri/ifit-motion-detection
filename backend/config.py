import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
    AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
    AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
    API_AUDIENCE = os.getenv("API_AUDIENCE")  
    ALGORITHMS = ["RS256"]
    MONGO_URI = os.getenv("MONGO_URI")  

config = Config()
