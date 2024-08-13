# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install ChromaDB
RUN pip install chromadb

# Copy the Python script that starts ChromaDB into the container
COPY start_chromadb.py /app/start_chromadb.py

# Expose port 8000 for the ChromaDB API
EXPOSE 6000

# Run the ChromaDB server using the Python script
CMD ["python", "/app/start_chromadb.py"]
