from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import datetime
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from contextlib import asynccontextmanager

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orchestrator")

# --- MODELS ---
class BrowserConfig(BaseModel):
    name: str
    theme_color: str = "#00d4ff"
    block_telemetry: bool = True
    kiosk_mode: bool = False
    vpn_tunnel: bool = False
    anti_fingerprint: bool = True

class BuildJobStatus(BaseModel):
    id: str
    status: str
    config: dict
    timestamp: str
    download_url: Optional[str] = None
    error_log: Optional[str] = None

# --- FIREBASE STATE ---
class FirebaseState:
    db = None
    connected = False

state = FirebaseState()

def init_firebase():
    """Initializes Firebase Admin SDK using service account key or env var."""
    try:
        # Priority: Environment variable path -> fallback to local file
        key_path = os.getenv("FIREBASE_KEY_PATH", "firebase-key.json")
        
        if not os.path.exists(key_path) and not os.getenv("FIREBASE_KEY_PATH"):
            logger.warning(f"⚠️ Firebase key not found at {key_path}. Functionality will be limited.")
            return

        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        state.db = firestore.client()
        state.connected = True
        logger.info("✅ Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    init_firebase()
    yield
    # Shutdown logic (if any)

# --- APP INITIALIZATION ---
app = FastAPI(
    title="BrowserForge Orchestrator",
    version="2.0",
    lifespan=lifespan
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://forge-builder-suite.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE HELPERS ---
def get_db():
    if not state.connected or state.db is None:
        raise HTTPException(status_code=503, detail="Firebase service unavailable")
    return state.db

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {
        "service": "BrowserForge Orchestrator",
        "status": "online",
        "version": "2.0",
        "firebase_connected": state.connected
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "firebase": "connected" if state.connected else "unavailable",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/build", response_model=BuildJobStatus)
async def create_build(config: BrowserConfig, db = Depends(get_db)):
    """Creates a new build job in Firestore."""
    try:
        job_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now().isoformat()
        
        job_data = {
            "config": config.model_dump(),
            "status": "QUEUED",
            "timestamp": timestamp
        }
        
        # Write to Firestore
        db.collection("build_jobs").document(job_id).set(job_data)
        logger.info(f"🚀 Created new build job: {job_id}")
        
        return {
            "id": job_id,
            "status": "QUEUED",
            "config": config.model_dump(),
            "timestamp": timestamp
        }
    except Exception as e:
        logger.error(f"❌ Error creating build job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{job_id}", response_model=BuildJobStatus)
async def get_status(job_id: str, db = Depends(get_db)):
    """Retrieves the status of a specific build job."""
    try:
        doc_ref = db.collection("build_jobs").document(job_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Job not found")
        
        data = doc.to_dict()
        return {
            "id": job_id,
            "status": data.get("status", "UNKNOWN"),
            "config": data.get("config", {}),
            "timestamp": data.get("timestamp"),
            "download_url": data.get("download_url"),
            "error_log": data.get("error_log")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching status for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs")
async def list_jobs(db = Depends(get_db)):
    """Lists the last 50 build jobs."""
    try:
        jobs_ref = db.collection("build_jobs")
        query = jobs_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(50)
        docs = query.stream()
        
        jobs = []
        for doc in docs:
            data = doc.to_dict()
            jobs.append({
                "id": doc.id,
                "status": data.get("status"),
                "config": data.get("config"),
                "timestamp": data.get("timestamp"),
                "download_url": data.get("download_url"),
                "error_log": data.get("error_log")
            })
        
        return {"jobs": jobs}
    except Exception as e:
        logger.error(f"❌ Error listing jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
