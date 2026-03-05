# --- server.py: DIAGNOSTIC VERSION 2 (Testing Database) ---
# --- Replace the ENTIRE content of backend/server.py with this ---

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os
import motor.motor_asyncio

# --- Database Connection Code ---
# We are adding this back to test it.
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

client = None
db = None

# Check if the MONGODB_URI was loaded
if MONGODB_URI:
    try:
        # This is the line that connects to the database
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
        db = client.get_database("compliance_db")
        print("--- Successfully initialized database connection ---")
    except Exception as e:
        # If this fails, we will know the URI is wrong
        print(f"--- FAILED to connect to the database: {e} ---")
        db = None
else:
    print("--- MONGODB_URI not found in environment variables ---")

# --- FastAPI Application ---
app = FastAPI()

# --- New Test Endpoint ---
# This endpoint will test if we can read from the database.
@app.get("/api/test-db")
async def test_db_connection():
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is not available.")
    
    try:
        # Try to count the documents in your 'questions' collection
        question_count = await db.questions.count_documents({})
        return {"message": "Successfully connected to DB and fetched data!", "question_count": question_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")
