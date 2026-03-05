# --- The Simplest Possible server.py ---
# --- Replace the ENTIRE content of backend/server.py with this ---

from fastapi import FastAPI

# Create the app
app = FastAPI()

# Define a single endpoint at the root URL "/"
@app.get("/")
def read_root():
    return {"message": "Hello World"}
