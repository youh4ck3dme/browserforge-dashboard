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
                
                try:
                    # 1. Update status to BUILDING
                    print(f"🔄 Updating status to BUILDING...")
                    job_ref.update({'status': 'BUILDING'})
                    time.sleep(2) # Simulating prep time
                    
                    # 2. Simulate Compilation progress
                    stages = ["FETCHING_SOURCE", "APPLYING_FLAGS", "COMPILING", "PACKAGING"]
                    for stage in stages:
                        print(f"⚙️ [{stage}] processing...")
                        job_ref.update({'status': f'BUILDING: {stage}'})
                        time.sleep(3) # Simulating heavy lifting (in reality this takes hours)
                        
                    # 3. Simulate uploading artifact to Storage
                    print(f"📦 Uploading artifact to Firebase Storage...")
                    fake_download_url = f"https://browserforge-dl.corp/{config.get('name', 'browser')}_{job_id}.zip"
                    time.sleep(1)
                    
                    # 4. Finish the job
                    print(f"✅ Job {job_id} completed successfully!")
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
