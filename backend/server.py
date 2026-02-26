from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

from rules_engine import classify_assessment, RULES_VERSION
from questions import QUESTIONS, QUESTION_SET_VERSION
from roadmap_generator import generate_roadmap

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'ai-act-copilot-secret-key-change-in-prod')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="KODEX API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class ProjectCreate(BaseModel):
    name: str
    org_name: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    org_name: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    org_name: Optional[str] = None
    created_at: str
    assessment_count: int = 0
    latest_bucket: Optional[str] = None

class AssessmentCreate(BaseModel):
    project_id: str
    answers_json: Dict[str, Any]
    estimator_inputs_json: Optional[Dict[str, Any]] = None

class AssessmentResponse(BaseModel):
    id: str
    project_id: str
    version: int
    question_set_version: str
    rules_version: str
    answers_json: Dict[str, Any]
    classification_json: Dict[str, Any]
    estimator_inputs_json: Optional[Dict[str, Any]] = None
    estimator_output_json: Optional[Dict[str, Any]] = None
    roadmap_json: List[Dict[str, Any]]
    created_at: str

class SettingsUpdate(BaseModel):
    currency: Optional[str] = None
    default_turnover: Optional[float] = None
    penalty_tier_model: Optional[str] = None
    tier_parameters: Optional[Dict[str, Any]] = None
    disclaimer_text: Optional[str] = None

class SettingsResponse(BaseModel):
    id: str
    user_id: str
    currency: str
    default_turnover: Optional[float]
    penalty_tier_model: str
    tier_parameters: Dict[str, Any]
    disclaimer_text: str

class ClassifyRequest(BaseModel):
    answers_json: Dict[str, Any]

class EstimatorRequest(BaseModel):
    classification_bucket: str
    turnover: float
    currency: str
    tier_parameters: Dict[str, Any]

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except:
        return None

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    # Create default settings
    settings = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "currency": "EUR",
        "default_turnover": None,
        "penalty_tier_model": "A",
        "tier_parameters": {
            "A": {"min_percent": 0.5, "max_percent": 3, "description": "General AI Act violations"},
            "B": {"min_percent": 1.5, "max_percent": 7, "description": "High-risk system violations"},
            "C": {"min_percent": 2, "max_percent": 6, "fixed_max": 35000000, "description": "Prohibited AI practices"}
        },
        "disclaimer_text": "Educational information only — not legal advice. Consult qualified counsel."
    }
    await db.settings.insert_one(settings)
    
    token = create_token(user_id, data.email)
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=data.email, created_at=user["created_at"])
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        token=token,
        user=UserResponse(id=user["id"], email=user["email"], created_at=user["created_at"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], created_at=user["created_at"])

# ============ PROJECT ROUTES ============

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(data: ProjectCreate, user=Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "user_id": user["id"],
        "name": data.name,
        "org_name": data.org_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project)
    return ProjectResponse(**project, assessment_count=0)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(bucket: Optional[str] = None, search: Optional[str] = None, user=Depends(get_current_user)):
    query = {"user_id": user["id"]}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    projects = await db.projects.find(query, {"_id": 0}).to_list(1000)
    
    result = []
    for p in projects:
        # Get assessment count and latest bucket
        assessments = await db.assessments.find(
            {"project_id": p["id"]}, 
            {"_id": 0, "classification_json": 1}
        ).sort("created_at", -1).to_list(100)
        
        latest_bucket = None
        if assessments and assessments[0].get("classification_json"):
            latest_bucket = assessments[0]["classification_json"].get("bucket")
        
        # Filter by bucket if specified
        if bucket and latest_bucket != bucket:
            continue
            
        result.append(ProjectResponse(
            **p,
            assessment_count=len(assessments),
            latest_bucket=latest_bucket
        ))
    
    return result

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    assessments = await db.assessments.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    latest_bucket = None
    if assessments:
        latest = sorted(assessments, key=lambda x: x["created_at"], reverse=True)[0]
        if latest.get("classification_json"):
            latest_bucket = latest["classification_json"].get("bucket")
    
    return ProjectResponse(**project, assessment_count=len(assessments), latest_bucket=latest_bucket)

@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, data: ProjectUpdate, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return ProjectResponse(**updated, assessment_count=0)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.assessments.delete_many({"project_id": project_id})
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project deleted"}

# ============ ASSESSMENT ROUTES ============

@api_router.post("/assessments", response_model=AssessmentResponse)
async def create_assessment(data: AssessmentCreate, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": data.project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get version number
    existing = await db.assessments.find({"project_id": data.project_id}).to_list(100)
    version = len(existing) + 1
    
    # Run classification
    classification = classify_assessment(data.answers_json)
    
    # Generate roadmap
    roadmap = generate_roadmap(classification, data.answers_json)
    
    # Calculate estimator if inputs provided
    estimator_output = None
    if data.estimator_inputs_json:
        estimator_output = calculate_fine_exposure(
            classification["bucket"],
            data.estimator_inputs_json
        )
    
    assessment_id = str(uuid.uuid4())
    assessment = {
        "id": assessment_id,
        "project_id": data.project_id,
        "version": version,
        "question_set_version": QUESTION_SET_VERSION,
        "rules_version": RULES_VERSION,
        "answers_json": data.answers_json,
        "classification_json": classification,
        "estimator_inputs_json": data.estimator_inputs_json,
        "estimator_output_json": estimator_output,
        "roadmap_json": roadmap,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.assessments.insert_one(assessment)
    
    return AssessmentResponse(**assessment)

@api_router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str, user=Depends(get_current_user)):
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    project = await db.projects.find_one({"id": assessment["project_id"], "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return AssessmentResponse(**assessment)

@api_router.get("/projects/{project_id}/assessments", response_model=List[AssessmentResponse])
async def list_project_assessments(project_id: str, user=Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    assessments = await db.assessments.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    return [AssessmentResponse(**a) for a in sorted(assessments, key=lambda x: x["version"], reverse=True)]

@api_router.post("/assessments/{assessment_id}/duplicate", response_model=AssessmentResponse)
async def duplicate_assessment(assessment_id: str, user=Depends(get_current_user)):
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    project = await db.projects.find_one({"id": assessment["project_id"], "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Create new assessment with same answers
    return await create_assessment(
        AssessmentCreate(
            project_id=assessment["project_id"],
            answers_json=assessment["answers_json"],
            estimator_inputs_json=assessment.get("estimator_inputs_json")
        ),
        user
    )

# ============ CLASSIFICATION & ESTIMATOR ============

@api_router.post("/classify")
async def classify(data: ClassifyRequest):
    return classify_assessment(data.answers_json)

@api_router.get("/questions")
async def get_questions():
    return {"questions": QUESTIONS, "version": QUESTION_SET_VERSION}

def calculate_fine_exposure(bucket: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    turnover = inputs.get("turnover", 0)
    tier_params = inputs.get("tier_parameters", {})
    
    if not turnover or turnover <= 0:
        return {
            "error": "Set turnover to run simulation",
            "min": None,
            "max": None,
            "assumptions": []
        }
    
    # Map bucket to tier
    tier_map = {
        "Prohibited": "C",
        "High-risk": "B",
        "Limited risk": "A",
        "Minimal risk": "A",
        "Needs clarification": "A"
    }
    tier = tier_map.get(bucket, "A")
    params = tier_params.get(tier, {"min_percent": 0.5, "max_percent": 3})
    
    min_fine = turnover * (params.get("min_percent", 0.5) / 100)
    max_fine = turnover * (params.get("max_percent", 3) / 100)
    
    # Apply fixed caps if present
    if "fixed_max" in params:
        max_fine = min(max_fine, params["fixed_max"])
    
    assumptions = [
        f"Annual turnover: {inputs.get('currency', 'EUR')} {turnover:,.0f}",
        f"Penalty tier: {tier} ({params.get('description', 'Based on classification')})",
        f"Percentage range: {params.get('min_percent', 0.5)}% - {params.get('max_percent', 3)}%"
    ]
    
    return {
        "min": round(min_fine, 2),
        "max": round(max_fine, 2),
        "currency": inputs.get("currency", "EUR"),
        "tier": tier,
        "assumptions": assumptions
    }

@api_router.post("/estimate")
async def estimate_fine(data: EstimatorRequest):
    return calculate_fine_exposure(data.classification_bucket, {
        "turnover": data.turnover,
        "currency": data.currency,
        "tier_parameters": data.tier_parameters
    })

# ============ SETTINGS ROUTES ============

@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings(user=Depends(get_current_user)):
    settings = await db.settings.find_one({"user_id": user["id"]}, {"_id": 0})
    if not settings:
        # Create default settings
        settings = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "currency": "EUR",
            "default_turnover": None,
            "penalty_tier_model": "A",
            "tier_parameters": {
                "A": {"min_percent": 0.5, "max_percent": 3, "description": "General AI Act violations"},
                "B": {"min_percent": 1.5, "max_percent": 7, "description": "High-risk system violations"},
                "C": {"min_percent": 2, "max_percent": 6, "fixed_max": 35000000, "description": "Prohibited AI practices"}
            },
            "disclaimer_text": "Educational information only — not legal advice. Consult qualified counsel."
        }
        await db.settings.insert_one(settings)
    return SettingsResponse(**settings)

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(data: SettingsUpdate, user=Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.settings.update_one({"user_id": user["id"]}, {"$set": update_data})
    
    settings = await db.settings.find_one({"user_id": user["id"]}, {"_id": 0})
    return SettingsResponse(**settings)

# ============ EXPORT ROUTE ============

@api_router.get("/export/{assessment_id}")
async def export_assessment(assessment_id: str, user=Depends(get_current_user)):
    assessment = await db.assessments.find_one({"id": assessment_id}, {"_id": 0})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    project = await db.projects.find_one({"id": assessment["project_id"], "user_id": user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    settings = await db.settings.find_one({"user_id": user["id"]}, {"_id": 0})
    
    return {
        "project": project,
        "assessment": assessment,
        "disclaimer": settings.get("disclaimer_text", "Educational information only — not legal advice.") if settings else "Educational information only — not legal advice."
    }

# ============ ROOT & HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "KODEX API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
