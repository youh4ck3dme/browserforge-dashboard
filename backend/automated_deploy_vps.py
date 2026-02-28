import paramiko
from scp import SCPClient
import os

def deploy():
    host = "194.182.87.6"
    user = "root"
    p = "Poklop123#####"
    
    print(f"🚀 Connecting to VPS {host}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(host, username=user, password=p)
        print("✅ Connected!")

        # remote_path is a Linux path
        remote_path = "/app/browserforge-worker"
        ssh.exec_command(f"rm -rf {remote_path} && mkdir -p {remote_path}")

        print("📦 Uploading files...")
        with SCPClient(ssh.get_transport()) as scp:
            # Transfer worker files - Use forward slashes for destination
            scp.put("worker.py", f"{remote_path}/worker.py")
            scp.put("Dockerfile", f"{remote_path}/Dockerfile")
            scp.put("requirements.txt", f"{remote_path}/requirements.txt")
            scp.put("firebase-key.json", f"{remote_path}/firebase-key.json")

        print("🛠️ Building Docker image on VPS...")
        stdin, stdout, stderr = ssh.exec_command(
            f"cd {remote_path} && docker build -t browserforge-worker .", 
            get_pty=True
        )
        for line in stdout:
            print(line.strip())

        print("🛑 Removing old container...")
        ssh.exec_command("docker rm -f browserforge-worker || true")

        print("🚀 Starting new container...")
        ssh.exec_command(
            f"docker run -d --name browserforge-worker --restart always "
            f"-v {remote_path}/firebase-key.json:/app/firebase-key.json "
            f"browserforge-worker"
        )
        
        print("\n✅ WORKER DEPLOYED SUCCESSFULLY!")
        print("Logs: docker logs -f browserforge-worker")

    finally:
        ssh.close()

if __name__ == "__main__":
    deploy()
