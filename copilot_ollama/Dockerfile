# Use an official Ubuntu base image
FROM ubuntu:20.04

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Expose the port that Ollama will use
EXPOSE 11434
EXPOSE 11435
# Command to run the Ollama service
CMD ["ollama", "serve"]
