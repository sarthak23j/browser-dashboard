"""
Browser Dashboard — FastAPI application entry point.

Serves the built frontend. User settings are stored in each browser's
localStorage, so no database is required.

Running (production):
  1. npm run build          (in the project root, once)
  2. python main.py         (from the backend/ directory)

Running (development, hot-reload):
  Terminal 1:  python main.py --reload   (backend)
  Terminal 2:  npm run dev               (frontend, proxies /api to backend)

Port:
  Set PORT in backend/.env (default: 8000).
  The Vite dev proxy reads the same value via VITE_BACKEND_PORT in .env.
"""

import argparse
import os
from pathlib import Path
from dotenv import load_dotenv

import uvicorn

# Load optional environment variables from the project root.
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

from fastapi import FastAPI
from fastapi.responses import FileResponse

# Resolve the dist/ directory relative to this file (backend/../dist)
DIST_DIR = Path(__file__).parent.parent / "dist"


app = FastAPI(
    title="Browser Dashboard API",
    description="System stats API for the browser dashboard.",
    version="1.0.0",
)

# ── Frontend static file serving ────────────────────────────────────────────
if DIST_DIR.exists():
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Catch-all route: serve index.html for any non-API path.

        viteSingleFile bundles everything into a single index.html,
        so no separate assets/ directory needs to be mounted.
        """
        return FileResponse(str(DIST_DIR / "index.html"))

    @app.get("/", include_in_schema=False)
    async def serve_root():
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    print(
        f"[WARNING] Frontend dist directory not found at {DIST_DIR}.\n"
        "Run `npm run build` in the project root to build the frontend."
    )

# ── Entrypoint ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))

    parser = argparse.ArgumentParser(description="Browser Dashboard backend")
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload (development mode)",
    )
    args = parser.parse_args()

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=args.reload,
    )
