#!/bin/bash

# --- CONFIGURATION ---
CONTAINER_NAME="browserforge-worker"
IMAGE_NAME="browserforge-worker"

echo "🚀 Starting BrowserForge Worker Deployment..."

# 1. Stop and remove existing container if running
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo "Stopping existing container..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# 2. Build the new image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

# 3. Run the container
# Note: We mount the firebase-key.json from the host for security
echo "Starting new container..."
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -v $(pwd)/firebase-key.json:/app/firebase-key.json \
    ${IMAGE_NAME}

echo "✅ Deployment complete! Check logs with: docker logs -f ${CONTAINER_NAME}"
