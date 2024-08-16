#!/bin/bash

# Create the necessary directories if they don't exist
mkdir -p app_data
mkdir -p data
docker pull mujahid002/sherlock-ai-frontend
docker pull mujahid002/sherlock-ai-backend
# Run Docker Compose with the --build flag
docker compose up -d
