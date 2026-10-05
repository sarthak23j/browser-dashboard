# Browser Dashboard

A minimalistic, customizable search landing page for your browser, built with React and Vite. It supports quick search redirection commands ("bangs") similar to DuckDuckGo, allowing you to instantly jump to search results on specific websites or default to a standard search.

## Features

- **Quick Search Redirects ("Bangs")**: Prefix your search with a registered alias (e.g., `y cat videos`) to search directly on YouTube, or just enter the alias alone (e.g., `y`) to visit the site's home page.
- **Custom Bang Editor**: Add, edit, or delete search redirects directly from the settings interface.
- **Starter Bangs**: New browser profiles start with shortcuts for Amazon, ChatGPT, Claude, F1TV, FitGirl, GitHub, Gmail, Reddit, Twitch, Twitter, and YouTube.
- **Per-browser Settings**: Bangs, the greeting name, and appearance preferences are saved in that browser's `localStorage`; they do not sync across browsers or devices.
- **Personalized Greetings**: Set a name for greetings that vary by local time of day. There are 15 greeting options each for morning, afternoon, evening, and night.
- **Customizable Appearance**: Choose a light or dark neutral backdrop, then select one of four accent-color presets or pick a custom accent color.
- **Import / Export**: Back up and restore bang configurations as JSON.
- **Settings**: Manage shortcuts, import/export, edit your greeting name, and customize the theme at `/settings`. The old `/bangs` route redirects to `/settings`.
- **Minimalist Design**: Responsive search interface with visual feedback for matched search bangs.

The app has no user database or system-monitoring endpoint. The Pi system monitor
and its API were removed; the backend only serves the built frontend.

## Getting Started

### Installation

First, clone the repository and install the dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

### Build

To bundle the application for production:

```bash
npm run build
```

### Docker and Cloudflare Tunnel

The supplied Compose file publishes the app on host port `1337`, forwarding to
container port `8000`. If `cloudflared` runs directly on the Docker host, point
the tunnel origin at `http://localhost:1337`. If `cloudflared` runs in a
container, `localhost` refers to that container, not this app: use the Docker
host's reachable address with port `1337`, or attach both containers to a
shared Docker network and route to `http://browser-dashboard:8000`. The app
does not require a database or persistent container volume; user settings stay
in each browser's local storage.

Before publishing a tunnel hostname, configure a Cloudflare Access application
and an allow policy for the intended users. Protect the whole hostname to
restrict access to the dashboard. The published `1337` port is reachable on
host interfaces. Restrict it with the host firewall if it should only be
reachable through the tunnel. For a non-published origin, attach both
containers to a shared private Docker network and remove the host port mapping.

The clock uses each visitor's local time and browser locale. Themes are stored
per browser. Import and export JSON to move shortcuts between browsers or
devices. New defaults are only applied when a browser has no saved bang list;
they do not replace existing shortcuts.

## Structure

- `src/pages/Home.jsx`: Main search landing page with search redirection logic.
- `src/pages/Bangs.jsx`: Settings interface for bang actions, import/export, the greeting name, and theme customization.
- `src/services/bangsStorage.js`: Default search presets and browser-local storage.
- `src/services/userSettings.js`: Browser-local greeting name.
- `src/services/themeSettings.js`: Backdrop and accent settings.
- `src/data/greetings.json`: Time-of-day greeting templates (15 per period).
- `backend/main.py`: FastAPI server for the built frontend; no database or system-stats API.
