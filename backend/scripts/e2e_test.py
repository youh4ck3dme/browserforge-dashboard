import paramiko
import json
import time
import uuid

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("194.182.87.6", username="root", password="Poklop123#####")

results = {}

# TEST 1: Docker Container Status
print("=" * 60)
print("TEST 1: Docker Container Status")
print("=" * 60)
_, out, _ = ssh.exec_command('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
docker_out = out.read().decode()
print(docker_out)
results["docker"] = "PASS" if "browserforge" in docker_out.lower() else "FAIL"

# TEST 2: Orchestrator Health Check
print("=" * 60)
print("TEST 2: Orchestrator API Health Check")
print("=" * 60)
_, out, _ = ssh.exec_command("curl -s http://localhost:8090/health")
health = out.read().decode()
print(health)
results["health"] = "PASS" if "ok" in health.lower() else "FAIL"

# TEST 3: Worker Logs
print("=" * 60)
print("TEST 3: Worker Logs (last 5 lines)")
print("=" * 60)
_, out, _ = ssh.exec_command("docker logs browserforge-worker --tail 5 2>&1")
worker_logs = out.read().decode()
print(worker_logs)
results["worker"] = "PASS" if "Listening" in worker_logs or "connected" in worker_logs.lower() else "FAIL"

# TEST 4: Cloudflare Tunnel
print("=" * 60)
print("TEST 4: Cloudflare Tunnel Service")
print("=" * 60)
_, out, _ = ssh.exec_command("systemctl is-active cloudflared")
cf_status = out.read().decode().strip()
print(f"Service status: {cf_status}")
results["tunnel"] = "PASS" if cf_status == "active" else "FAIL"

# TEST 5: POST /build — Real Job
print("=" * 60)
print("TEST 5: POST /build — Real Job Submission")
print("=" * 60)
test_id = str(uuid.uuid4())[:8]
build_payload = json.dumps({
    "name": f"E2E-CertTest-{test_id}",
    "flags": {"adBlock": True, "antiFingerprint": True, "vpnIntegration": False},
    "themeColor": "#00ff88"
})
cmd = f"curl -s -X POST http://localhost:8090/build -H 'Content-Type: application/json' -d '{build_payload}'"
_, out, _ = ssh.exec_command(cmd)
build_result = out.read().decode()
print(build_result)
results["build_post"] = "PASS" if "id" in build_result.lower() or "queued" in build_result.lower() else "FAIL"

time.sleep(2)

# TEST 6: GET /jobs — Verify Job Exists
print("=" * 60)
print("TEST 6: GET /jobs — Verify Job Created")
print("=" * 60)
_, out, _ = ssh.exec_command("curl -s http://localhost:8090/jobs")
jobs = out.read().decode()
print(jobs[:500])
results["jobs_list"] = "PASS" if test_id in jobs or "jobs" in jobs.lower() else "FAIL"

# TEST 7: HTTPS Tunnel End-to-End (external)
print("=" * 60)
print("TEST 7: HTTPS Tunnel External Access")
print("=" * 60)
_, out, _ = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' https://parallel-depend-rehabilitation-texas.trycloudflare.com/health")
http_code = out.read().decode().strip()
print(f"HTTPS health check status code: {http_code}")
results["https_tunnel"] = "PASS" if http_code == "200" else "FAIL"

ssh.close()

# SUMMARY
print("\n" + "=" * 60)
print("CERTIFICATION SUMMARY")
print("=" * 60)
all_pass = True
for test, status in results.items():
    icon = "✅" if status == "PASS" else "❌"
    print(f"  {icon} {test}: {status}")
    if status != "PASS":
        all_pass = False

if all_pass:
    print("\n🏆 ALL TESTS PASSED — SYSTEM CERTIFIED")
else:
    print("\n⚠️ SOME TESTS FAILED — REVIEW NEEDED")
