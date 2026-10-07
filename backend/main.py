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
import hashlib
import os
from pathlib import Path
from dotenv import load_dotenv

import uvicorn

# Load optional environment variables from the project root.
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, Request
from fastapi.responses import Response

# Resolve the dist/ directory relative to this file (backend/../dist)
DIST_DIR = Path(__file__).parent.parent / "dist"

# ── Pre-load index.html into memory ─────────────────────────────────────────
# Serving from memory (instead of streaming from disk via FileResponse) gives
# the response a known Content-Length upfront. This lets the browser close the
# HTTP response cleanly the moment the last byte arrives, eliminating the
# spinner-stuck-open bug caused by chunked-stream tail delays over the
# Cloudflare tunnel + Raspberry Pi SD card I/O.
_INDEX_HTML: bytes | None = None
_INDEX_ETAG: str | None = None

_index_path = DIST_DIR / "index.html"
if _index_path.exists():
    _INDEX_HTML = _index_path.read_bytes()
    # ETag is an MD5 of the file content — lets browsers skip re-downloading
    # an unchanged build (304 Not Modified), and lets Cloudflare revalidate
    # its cache efficiently.
    _INDEX_ETAG = f'"{hashlib.md5(_INDEX_HTML).hexdigest()}"'  # noqa: S324
    print(
        f"[INFO] Loaded index.html into memory "
        f"({len(_INDEX_HTML) / 1024:.1f} KB, ETag: {_INDEX_ETAG})"
    )


app = FastAPI(
    title="Browser Dashboard API",
    description="System stats API for the browser dashboard.",
    version="1.0.0",
)

# ── Frontend static file serving ────────────────────────────────────────────
if _INDEX_HTML is not None:
    _HEADERS = {
        # Cache for 1 hour on the browser and at Cloudflare's edge PoP.
        # On redeploy the ETag will change, so stale caches revalidate correctly.
        "Cache-Control": "public, max-age=3600",
        "ETag": _INDEX_ETAG,
    }

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(request: Request, full_path: str = ""):
        """Catch-all route: serve index.html for any non-API path.

        viteSingleFile bundles everything into a single index.html,
        so no separate assets/ directory needs to be mounted.

        The file is read once at startup and held in memory. Responses carry
        an explicit Content-Length (from the in-memory bytes), so the browser
        knows exactly when the response ends and closes the spinner immediately.
        Conditional GET (If-None-Match) is handled so repeat visits get a
        lightweight 304 instead of re-downloading the full bundle.
        """
        # Honour conditional GET: if the client already has this exact build,
        # return 304 with no body — saves bandwidth and is instant.
        if request.headers.get("if-none-match") == _INDEX_ETAG:
            return Response(status_code=304, headers=_HEADERS)

        return Response(
            content=_INDEX_HTML,
            media_type="text/html",
            headers=_HEADERS,
        )
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
