@echo off

REM Create the necessary directories if they don't exist
if not exist app_data mkdir app_data
if not exist data mkdir data

REM Run Docker Compose with the --build flag
docker-compose up --build -d
