# --- FINAL, CORRECTED server.py ---
# --- This version fixes the "NotImplementedError" ---

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import motor.motor_asyncio
from pydantic import BaseModel
from typing import List

# --- Pydantic Models (data shapes) ---
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
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize clients
db_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = db_client.get_database("kodexcompliance_db") # Using your correct DB name

from openai import OpenAI
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# --- FastAPI App ---
app = FastAPI()

# --- CORS Middleware (Allows frontend to talk to backend) ---
origins = [
    "https://addo-nyarko.github.io",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/api/questions", response_model=List[Question])
async def get_questions():
    # THIS IS THE FIX: Using "is None" for the check
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is not available.")
    try:
        questions_cursor = db.questions.find().sort("id", 1)
        questions_list = [Question(**doc) for doc in await questions_cursor.to_list(length=100)]
        if not questions_list:
            raise HTTPException(status_code=404, detail="No questions found in the database.")
        return questions_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions from database: {e}")

@app.post("/api/conversation", response_model=ConversationResponse)
async def handle_conversation(state: ConversationState):
    # THIS IS THE FIX: Using "is None" for the checks
    if openai_client is None:
        raise HTTPException(status_code=503, detail="OpenAI client is not initialized. Please check your API key.")
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection is not available.")

    try:
        all_questions_cursor = db.questions.find().sort("id", 1)
        all_questions = [Question(**doc) for doc in await all_questions_cursor.to_list(length=100)]
        if not all_questions:
            raise HTTPException(status_code=404, detail="No questions found to start conversation.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed during conversation: {e}")

    if state.messages and state.messages[-1].role == 'user':
        last_user_message = state.messages[-1].content
        question_to_map_index = state.current_question_index - 1
        
        if 0 <= question_to_map_index < len(all_questions):
            question_to_map = all_questions[question_to_map_index]
            mapping_prompt = f"The user is answering: '{question_to_map.question}'. The user's response was: '{last_user_message}'. Classify it as 'Yes', 'No', or 'Unsure'. Respond with ONLY the word."
            
            try:
                mapping_completion = openai_client.chat.completions.create(
                    model="gpt-3.5-turbo", messages=[{"role": "system", "content": mapping_prompt}], temperature=0, max_tokens=5
                )
                mapped_answer = mapping_completion.choices[0].message.content.strip()
                if mapped_answer not in ['Yes', 'No', 'Unsure']: mapped_answer = 'Unsure'
                state.answered_questions.append(AnsweredQuestion(question_text=question_to_map.question, answer=mapped_answer))
            except Exception:
                state.answered_questions.append(AnsweredQuestion(question_text=question_to_map.question, answer='Unsure'))

    if state.current_question_index >= len(all_questions):
        completion_message = "Thank you! We have completed the assessment. The final results are now available to review."
        state.messages.append(ChatMessage(role='assistant', content=completion_message))
        return ConversationResponse(ai_message=completion_message, updated_state=state, is_complete=True)

    current_question = all_questions[state.current_question_index]
    greeting = "Hello! I'm your Compliance Companion. I'll ask you a series of simple questions. Let's start.\n\n"
    
    asking_prompt = f"You are a friendly AI assistant. Your audience is non-technical. Rephrase this technical question in simple terms: '{current_question.question}'. Keep your response short and ask only one question at a time."
    
    full_prompt_messages = []
    if state.current_question_index == 0:
        full_prompt_messages.append({"role": "system", "content": greeting + asking_prompt})
    else:
        full_prompt_messages.append({"role": "system", "content": asking_prompt})

    try:
        asking_completion = openai_client.chat.completions.create(
            model="gpt-4o-mini", messages=full_prompt_messages, temperature=0.5, max_tokens=150
        )
        ai_response_message = asking_completion.choices[0].message.content.strip()
    except Exception as e:
        ai_response_message = f"I'm sorry, an error occurred. Please check your OpenAI API key and that you have funds available. Error: {e}"

    state.messages.append(ChatMessage(role='assistant', content=ai_response_message))
    state.current_question_index += 1
    return ConversationResponse(ai_message=ai_response_message, updated_state=state, is_complete=False)
