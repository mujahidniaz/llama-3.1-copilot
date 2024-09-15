#!/bin/bash
mkdir -p app_data
mkdir -p data
docker pull mujahid002/sherlock-ai-frontend
docker pull mujahid002/sherlock-ai-backend
docker compose up -d
