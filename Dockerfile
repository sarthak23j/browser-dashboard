# ==========================================
# Stage 1: Build the frontend static files
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy only the files needed for building the frontend
COPY vite.config.js index.html ./
COPY src/ ./src
COPY public/ ./public

# Build the production bundle (generates dist/)
RUN npm run build

# ==========================================
# Stage 2: Create the runtime Python environment
# ==========================================
FROM python:3.11-slim AS runtime
WORKDIR /app

# Install system dependencies if any are needed (e.g. for sqlite/compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies and install them
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source
COPY backend/ ./backend

# Copy the built frontend from Stage 1 into the location expected by FastAPI
COPY --from=frontend-builder /app/dist ./dist

# Create a directory to hold the SQLite database (so we can persist it via a volume)
RUN mkdir -p /app/data

# Environment variables
ENV PORT=8000
ENV DATABASE_URL=sqlite:////app/data/dashboard.db
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run the FastAPI server
# Note: main.py expects to run from the root directory or has sys.path configuration.
# Since main.py runs 'main:app', let's run uvicorn with working directory set to backend.
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
