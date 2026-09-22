# bdcinemas

> **Apple-Inspired Premium Cinematic Entertainment Platform**

**bdcinemas** is a modern, high-performance web platform delivering an editorial cinematic streaming experience for Bangladeshi cinema (Dhallywood), original thriller web series, and international masterworks with dual-audio and Bangla subtitles.

---

## ✨ Features

- **Apple-Inspired Design Language**: Minimal, high-contrast, Obsidian canvas (`#0A0A0C`), refined red accents (`#E50914`), translucent glass headers, and smooth micro-interactions.
- **Rich Catalog Organization**:
  - **Movies**: Masterpieces such as *Hawa*, *Aynabaji*, *Surongo*, *Poran*, *Rehana Maryam Noor*, and *Damal*.
  - **Web Series**: Multi-season, episodic sagas including *Mohanagar*, *Karagar*, and *Taqdeer*.
  - **Bangla Dubbed & Dual-Audio**: Globally celebrated blockbusters including *Oppenheimer*, *Interstellar*, and *K.G.F: Chapter 2*.
  - **12+ Curated Genres**: Thriller, Crime, Drama, Sci-Fi, Action, Mystery, Romance, Comedy, History, and War.
- **Cinematic Hero**: Ambient zoom transitions, synopsis, premiere badges, and quick-action triggers.
- **Browser-Based Video Player**:
  - Fullscreen overlay with auto-hiding controls.
  - Scrubbing timeline, 10s skip forward/backward.
  - Stream quality switcher (4K UHD, 1080p FHD, 720p HD).
  - Dual audio & subtitle selector (Off, Bangla, English).
  - Playback speed adjustment (0.75x, 1x, 1.25x, 1.5x).
  - Episode drawer for continuous binge-watching.
- **Local Persistence**:
  - **My List (Watchlist)**: Add, remove, and toggle saved titles directly in `localStorage`.
  - **Continue Watching**: Automatically saves playback positions and displays elapsed progress.
- **Instant Search**: Live multi-index query filtering by title, original Bengali title, actor, director, genre, and release year.
- **Admin Dashboard**: Live platform analytics (total movies, series, episodes, views), title ingestion form, and publish/delete controls.
- **SEO & PWA**:
  - Standalone PWA installation support with `manifest.json`.
  - Complete `sitemap.xml`, `robots.txt`, and Open Graph social metadata.
- **GitHub Pages Ready**: Configurable Vite base path and automated GitHub Actions workflow (`.github/workflows/deploy.yml`).

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Language**: TypeScript 5
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS transitions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node.js 22)
- npm 9+

### Installation

```bash
git clone https://github.com/BDcinemas/BDcinemas.git
cd BDcinemas
npm install
```

### Development Server

```bash
npm run dev
```

Runs the application locally at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

Compiles the production-ready bundle into the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📂 Project Structure

```
bdcinemas/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── ContentRow.tsx
│   │   ├── ContinueWatchingRow.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── MovieCard.tsx
│   │   ├── Navbar.tsx
│   │   └── VideoPlayerModal.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── hooks/
│   │   └── useWatchlist.ts
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── lib/
│   │   └── router.tsx
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── GenresPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LegalPage.tsx
│   │   ├── MediaDetailPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── WatchlistPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📜 Compliance & License

Only authorized, licensed, or public-domain video sources and sample media are used. No copyright-infringing content or unauthorized extraction tools are included.

Licensed under the MIT License.
