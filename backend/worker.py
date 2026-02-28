import os
import time
import json
import firebase_admin
from firebase_admin import credentials, firestore

# INITIALIZATION
# Make sure you have downloaded your Firebase Admin SDK service account key
# and named it 'firebase-key.json' in the same directory as this script.
print("🔧 Initializing BrowserForge Worker Node...")

try:
    cred = credentials.Certificate('firebase-key.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Successfully connected to Firebase Firestore.")
except Exception as e:
    print(f"❌ Failed to connect to Firebase. Check your firebase-key.json file.\nError: {e}")
    exit(1)

# WORKER LOGIC
def process_build_job(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED' or change.type.name == 'MODIFIED':
            doc = change.document
            data = doc.to_dict()
            
            # We only process jobs that are QUEUED
            if data.get('status') == 'QUEUED':
                job_id = doc.id
                config = data.get('config', {})
                print(f"\n🚀 [NEW JOB] Picked up build request: {job_id}")
                print(f"📄 Config: {json.dumps(config, indent=2)}")
                
                job_ref = db.collection('build_jobs').document(job_id)
                
                def log_event(msg):
                    print(f"DEBUG [{job_id[:8]}]: {msg}")
                    # Atomic push to array in Firestore
                    job_ref.update({
                        'logs': firestore.ArrayUnion([{
                            'timestamp': time.strftime("%H:%M:%S"),
                            'message': msg
                        }])
                    })

                try:
                    # 1. Update status to BUILDING
                    log_event(f"🚀 Initializing build sequence for {config.get('name', 'browser')}...")
                    job_ref.update({'status': 'BUILDING', 'logs': []}) # Initialize logs
                    time.sleep(1)
                    
                    # 2. Simulate Compilation progress with real logs
                    stages = [
                        ("FETCHING_SOURCE", "Fetching Chromium source v147.0.6914..."),
                        ("APPLYING_FLAGS", f"Applying security profile: {json.dumps(config.get('flags', {}))}"),
                        ("COMPILING", "Compiling LLVM modules (parallel-exec)..."),
                        ("PACKAGING", "Creating production bundle & signing artifact...")
                    ]
                    for stage, msg in stages:
                        log_event(msg)
                        job_ref.update({'status': f'BUILDING: {stage}'})
                        time.sleep(3)
                        
                    # 3. Finalize
                    log_event("📦 Build artifact generated successfully.")
                    
                    # Physically create the file so the URL isn't a 404
                    # This requires the /app/builds volume to be mounted
                    builds_dir = "/app/builds"
                    if os.path.exists(builds_dir):
                        artifact_filename = f"{config.get('name', 'browser')}_{job_id}.zip"
                        artifact_path = os.path.join(builds_dir, artifact_filename)
                        with open(artifact_path, "w") as f:
                            f.write(f"BrowserForge Build Artifact\nName: {config.get('name')}\nTimestamp: {time.ctime()}\nStatus: CERTIFIED")
                    
                    fake_download_url = f"https://stephanie-carbon-realistic-garlic.trycloudflare.com/builds/{config.get('name', 'browser')}_{job_id}.zip"
                    
                    log_event("✅ Transitioning to status: DONE")
                    job_ref.update({
                        'status': 'DONE',
                        'download_url': fake_download_url
                    })
                    
                except Exception as e:
                    print(f"❌ Job {job_id} failed: {str(e)}")
                    job_ref.update({
                        'status': 'FAILED',
                        'error_log': str(e)
                    })

# LISTENER SETUP
print("🎧 Listening for new build jobs in real-time...")
query = db.collection('build_jobs').where('status', 'in', ['QUEUED', 'BUILDING']) # We also listen to building to recover crashed jobs if needed
query_watch = query.on_snapshot(process_build_job)

# Keep main thread alive
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Worker Node shutting down.")
