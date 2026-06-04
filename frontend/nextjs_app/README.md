# WOODY OS Dashboard

This folder contains the Next.js dashboard frontend for the WOODY OS project.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dashboard:

   ```bash
   npm run dev
   ```

3. Open the app at `http://localhost:3000`

## Backend Integration

- The frontend expects the backend to be available at `http://localhost:8000`
- `GET /agents` and `POST /command` are used by the dashboard
- `POST /memory` is used by the memory page

## Notes

- CORS is enabled in the backend for local development.
- Start the backend with `uvicorn backend.main:app --reload` from the repository root.
