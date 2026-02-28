import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("194.182.87.6", username="root", password="Poklop123#####")

print("="*60)
print("INSURANCE TEST: Simulating Cloudflare Service Restart")
print("="*60)
ssh.exec_command("systemctl restart cloudflared")
time.sleep(5)

_, out, _ = ssh.exec_command("systemctl is-active cloudflared")
status = out.read().decode().strip()
print(f"Cloudflared status after restart: {status}")

print("="*60)
print("INSURANCE TEST: Simulating Worker Container Restart")
print("="*60)
ssh.exec_command("docker restart browserforge-worker")
time.sleep(5)

_, out, _ = ssh.exec_command("docker ps --filter 'name=browserforge-worker' --format '{{.Status}}'")
status = out.read().decode().strip()
print(f"Worker status after restart: {status}")

print("="*60)
print("FINAL CHECK: Health via External HTTPS")
print("="*60)
# Use the known working tunnel URL
cmd = "curl -s -o /dev/null -w '%{http_code}' https://parallel-depend-rehabilitation-texas.trycloudflare.com/health"
_, out, _ = ssh.exec_command(cmd)
code = out.read().decode().strip()
print(f"HTTPS External Health Check (200 expected): {code}")

ssh.close()
