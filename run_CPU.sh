#!/bin/bash
mkdir -p app_data
mkdir -p data
docker compose down
docker compose  -f docker-compose_CPU.yml  up --build -d