# Browser Dashboard

A minimalistic, customizable search landing page for your browser, built with React and Vite. It supports quick search redirection commands ("bangs") similar to DuckDuckGo, allowing you to instantly jump to search results on specific websites or default to a standard search.

## Features

- **Quick Search Redirects ("Bangs")**: Prefix your search with a registered alias (e.g., `y cat videos`) to search directly on YouTube, or just enter the alias alone (e.g., `y`) to visit the site's home page.
- **Custom Bang Editor**: Add, edit, or delete search redirects directly from the settings interface.
- **Local Persistence**: Custom configurations are saved locally in the browser's `localStorage`.
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

## Structure

- `src/pages/Home.jsx`: Main search landing page with search redirection logic.
- `src/pages/Bangs.jsx`: Settings interface to manage custom bang actions.
- `src/assets/bangs.json`: Default search presets (Google, DuckDuckGo, YouTube, GitHub, Wikipedia, etc.).

