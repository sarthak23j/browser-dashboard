# Browser Dashboard

A minimalistic, customizable search landing page for your browser, built with React and Vite. It supports quick search redirection commands ("bangs") similar to DuckDuckGo, allowing you to instantly jump to search results on specific websites or default to a standard search.

## Features

- **Quick Search Redirects ("Bangs")**: Prefix your search with a registered alias (e.g., `y cat videos`) to search directly on YouTube, or just enter the alias alone (e.g., `y`) to visit the site's home page.
- **Custom Bang Editor**: Add, edit, or delete search redirects directly from the settings interface.
- **Per-device Configuration**: Custom bangs are stored in the browser's `localStorage`.
- **Personalized Greeting**: Choose a name for time-of-day greetings; it is stored in that browser too.
- **Import / Export**: Back up and restore bang configurations as JSON.
- **Minimalist Design**: Clean search bar interface with dynamic visual feedback indicating matched search bangs.

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
does not require a database or persistent container volume.

Before publishing a tunnel hostname, configure a Cloudflare Access application
and an allow policy for the intended users. Protect the whole hostname,
to restrict access to the dashboard. The published `1337` port is reachable on
host interfaces. Restrict it with the host firewall if it should only be
reachable through the tunnel. For a non-published origin, attach both
containers to a shared private Docker network and remove the host port mapping.

The clock uses each visitor's local time and browser locale. Themes are stored
per browser, and bangs are stored per browser as well. Your shortcuts do not
sync between devices or browsers. Import and export JSON to move shortcuts
between devices. Your greeting name is also stored per browser. The app itself
keeps no user database.

The settings screen is available at `/settings`. It includes bang management
and a name editor. The name defaults to `user`, is saved in browser storage,
and is inserted into one of 15 greeting templates for each time of day in
`src/data/greetings.json`, selected by the visitor's local time.

## Structure

- `src/pages/Home.jsx`: Main search landing page with search redirection logic.
- `src/pages/Bangs.jsx`: Settings interface for bang actions and the greeting name.
- `src/services/bangsStorage.js`: Default search presets and browser-local storage.
- `src/data/greetings.json`: Time-of-day greeting templates.
