# Use Python 3.10 slim version
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required by Geopandas/Rtree
RUN apt-get update && apt-get install -y \
    libspatialindex-dev \
    gcc \
    libexpat1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them
COPY safety_model.pkl .
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the ML code
COPY . .

# Expose the port Flask runs on
EXPOSE 5001

# Run the Flask app
CMD ["python", "app.py"]