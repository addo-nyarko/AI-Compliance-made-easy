# --- DIAGNOSTIC server.py (No OpenAI Call) ---
# --- Replace the ENTIRE content of backend/server.py with this ---

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import motor.motor_asyncio
from pydantic import BaseModel
from typing import List

# --- Models ---
class ChatMessage(BaseModel):
    role: str
    content: str

class AnsweredQuestion(BaseModel):
    question_text: str
    answer: str

class Question(BaseModel):
    id: int
    question: str
    options: List[str]

class ConversationState(BaseModel):
    messages: List[ChatMessage]
    answered_questions: List[AnsweredQuestion]
    current_question_index: int = 0

class ConversationResponse(BaseModel):
    ai_message: str
    updated_state: ConversationState
    is_complete: bool

# --- Environment and Database Setup ---
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
# NOTE: We are not loading the OpenAI key for this test

# Initialize DB client
db_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = db_client.get_database("compliance_db")

# --- FastAPI App ---
app = FastAPI()

# --- CORS Middleware ---
origins = ["https://addo-nyarko.github.io", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/api/questions", response_model=List[Question])
async def get_questions():
    try:
        questions_cursor = db.questions.find().sort("id", 1)
        questions_list = [Question(**doc) for doc in await questions_cursor.to_list(length=100)]
        return questions_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {e}")

@app.post("/api/conversation", response_model=ConversationResponse)
async def handle_conversation(state: ConversationState):
    """
    DIAGNOSTIC VERSION: This function does NOT call the OpenAI API.
    It proves the database connection and the rest of the logic are working.
    """
    if not db:
        raise HTTPException(status_code=503, detail="Database connection is not available.")

    try:
        all_questions_cursor = db.questions.find().sort("id", 1)
        all_questions = [Question(**doc) for doc in await all_questions_cursor.to_list(length=100)]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

    if state.current_question_index >= len(all_questions):
        completion_message = "DIAGNOSTIC: End of conversation reached."
        state.messages.append(ChatMessage(role='assistant', content=completion_message))
        return ConversationResponse(ai_message=completion_message, updated_state=state, is_complete=True)

    current_question = all_questions[state.current_question_index]
    
    # HARDCODED RESPONSE - NO OPENAI CALL
    ai_response_message = f"DIAGNOSTIC SUCCESS: The server is working. The problem is your OpenAI key. I would now ask about: '{current_question.question}'"

    state.messages.append(ChatMessage(role='assistant', content=ai_response_message))
    state.current_question_index += 1
    return ConversationResponse(ai_message=ai_response_message, updated_state=state, is_complete=False)
