import firebase_admin
from firebase_admin import credentials, firestore
import os

print("🔍 Testing Firebase Connection...")

KEY_PATH = 'firebase-key.json'

if not os.path.exists(KEY_PATH):
    print(f"❌ Error: {KEY_PATH} not found in this directory.")
    print("👉 Please download your service account key from Firebase Console and save it as backend/firebase-key.json")
    exit(1)

try:
    cred = credentials.Certificate(KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    # Simple write/read test
    test_ref = db.collection('system_tests').document('connection_check')
    test_ref.set({
        'status': 'success',
        'timestamp': firestore.SERVER_TIMESTAMP
    })
    
    doc = test_ref.get()
    if doc.exists:
        print("✅ SUCCESS: Successfully wrote to and read from Firestore!")
        # Clean up
        test_ref.delete()
    else:
        print("❓ Weird: Write succeeded but document not found.")
        
except Exception as e:
    print(f"❌ Failed to connect: {e}")
