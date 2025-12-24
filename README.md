# Purrfect (Frontend Web)

Next.js (App Router) frontend for the Purrfect platform.

The app includes pages for authentication, adoptions, lost & found reports, rescues/alerts, maps, chats, profile, store/cart, leaderboard, and an admin dashboard.

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Google Maps (via `@react-google-maps/api` and direct JS API loading)

## Requirements

- Node.js (recommended: modern LTS)
- A running backend API (default assumed at `http://localhost:8000`)
- (Optional) A Google Maps API key for map/geocoding features

## Quick start

1) Install dependencies

```bash
npm install
```

2) Create `.env.local` in the project root

```bash
# Backend base URL (used by most pages/components)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Some pages/components currently read this alternative name as well
# (set it to the same value to avoid “stats/admin” calls failing)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Google Maps (required for map + geocoding + map picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE

# Optional: override the Lost & Found upload endpoint
# If not set, the app falls back to: ${NEXT_PUBLIC_API_URL}/lost-found/upload-s3?folder=lost-found
NEXT_PUBLIC_S3_UPLOAD_URL=
```

3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Authentication notes

- Route protection is enforced by [src/middleware.js](src/middleware.js): most pages require an `access_token` cookie.
- Many API calls also read `access_token` from `localStorage` and send `Authorization: Bearer <token>`.
- In local development, ensure your backend sets the token in a way that matches this frontend (cookie name `access_token` and/or `localStorage` key `access_token`).

## Scripts

```bash
npm run dev     # Next dev (turbopack)
npm run build   # Next build (turbopack)
npm run start   # Serve production build
npm run lint    # ESLint
```

## App routes (high level)

These are defined under `src/app/*` (App Router).

- `/` home
- `/signin`, `/signup` auth
- `/admin` admin dashboard
- `/lost-found` lost & found reports
- `/rescues` rescue missions
- `/map` map view
- `/store` store/cart
- `/adoptions` adoption flow
- `/profile` user profile
- `/leaderboard`, `/about`
- `/chats/[chatId]`, `/lost-found/[chatId]`, `/adoptions/[chatId]` (dynamic chat/detail pages)

## Troubleshooting

- **Google Maps not loading**: set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and ensure the key has the correct APIs enabled (Maps JavaScript API; Geocoding if you use address lookup).
- **Nearby/geo features not working**: browsers require geolocation on **HTTPS** (or `http://localhost`). Some pages disable nearby alerts when `window.isSecureContext` is false.
- **401/redirect loop to `/signin`**: you’re missing the `access_token` cookie (or backend auth isn’t aligned). Sign in via the backend/auth flow so the token is stored.
- **CORS issues**: configure the backend to allow requests from `http://localhost:3000` during development.

## Project structure

- `src/app/` — pages/routes (Next.js App Router)
- `src/app/components/` — UI + feature components (maps, modals, cards, etc.)
- `src/app/lib/` — helpers (e.g., geocoding)
- `public/` — static assets
