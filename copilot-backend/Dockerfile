# Use a smaller base image for the build stage
FROM python:3.11-slim AS build

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Use a minimal runtime image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the installed dependencies from the build stage
COPY --from=build /app /app

# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD ["python", "app.py"]
