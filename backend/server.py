# --- A MINIMAL server.py FOR DIAGNOSTICS ---
# --- Replace the ENTIRE content of backend/server.py with this ---

from fastapi import FastAPI
import os

# 1. Create the FastAPI application
app = FastAPI()

# 2. Define a single, simple endpoint for testing
@app.get("/")
def read_root():
    # This just proves the server is running.
    return {"Status": "Backend is running successfully!"}

# --- That is the entire file. ---
# --- We have temporarily removed all database and OpenAI code. ---
