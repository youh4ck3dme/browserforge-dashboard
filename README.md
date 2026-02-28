# 🛰️ BrowserForge Engineering Studio

Next-generation browser build farm and manufacturing control center. This repository contains the Frontend control plane and the Backend build orchestrator/worker logic.

## 🏗️ System Architecture

BrowserForge is built on a distributed event-driven architecture designed for high-performance browser manufacturing.

- **Frontend (React/Vite):** Mission control UI hosted on Vercel. Communicates with the Build Farm via a secure Cloudflare Tunnel.
- **Orchestrator API (FastAPI):** Central API running on VPS. Manages build jobs in Firestore and serves generated artifacts.
- **Build Worker (Docker/Python):** Scalable listener node that monitors Firestore for queued jobs and executes the physical build sequence.
- **Real-time Telemetry:** Synchronized log-streaming from Worker -> Firestore -> Frontend.

## 🚀 Deployment Overview

### 1. Frontend (Vercel)
The frontend is auto-deployed to [https://forge-builder-suite.vercel.app](https://forge-builder-suite.vercel.app).
- **SPA Routing:** Configured via `vercel.json` to handle client-side routes.
- **Branding:** Optimized for BrowserForge Studio identity.

### 2. Backend (VPS)
The backend services run on a Debian-based VPS.

#### Orchestrator
```bash
cd orchestrator
python3 main.py --port 8090
```

#### Worker Node (Docker)
```bash
cd backend
./deploy_worker.sh
```

## 🛠️ Components

- **`src/`**: React application source code.
- **`orchestrator/`**: FastAPI implementation for the central API.
- **`backend/`**: Python worker scripts and Docker environment.
- **`.github/workflows/`**: Continuous Integration (CI) pipeline for Linting and Testing.

## 💎 Diamond Certification Features
- [x] **Real-time CI:** Automated quality checks on every push.
- [x] **High-Fidelity Telemetry:** Live log arrays from the physical Worker node.
- [x] **Resilience Audit:** Auto-recovery configured for all Docker services and Tunnels.
- [x] **Artifact Serving:** Unified flow for building and downloading artifacts.

---

## 🔒 Security Best Practices

### Recommended Firestore Rules
To secure your build data, deploy these rules to your Firebase Console:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /build_jobs/{jobId} {
      allow read: if true; // Or restrict to authenticated users
      allow create: if request.resource.data.status == 'QUEUED';
      allow update: if false; // Only Admin SDK (Orchestrator/Worker) can update
    }
  }
}
```

## 🛠️ Maintenance & Recovery

To restart the build farm after a VPS reboot:
1. SSH into VPS.
2. `systemctl restart cloudflared` (Tunnels).
3. `cd forge-builder-suite/backend && ./deploy_worker.sh` (Worker).
4. `cd forge-builder-suite/orchestrator && nohup python3 main.py --port 8090 > orchestrator.log 2>&1 &` (Orchestrator).

**Engineering Lead:** AI Antigravity
**Status:** 100% Certified Online
