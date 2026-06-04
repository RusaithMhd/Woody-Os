# WOODY OS

WOODY OS is a personal AI operating system prototype built with a FastAPI backend, Python automation and memory modules, and a Next.js dashboard frontend.

## Project structure

- `backend/` — FastAPI app, agents, tools, and memory services
- `voice/` — speech-to-text, text-to-speech, wake word scaffolds
- `automation/` — browser and PC control helpers
- `frontend/nextjs_app/` — Next.js dashboard UI
- `requirements.txt` — Python dependencies
- `.env.example` — environment variable templates

## Quick start

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Install Playwright if needed:

   ```bash
   python -m playwright install
   ```

3. Run the backend:

   ```bash
   uvicorn backend.main:app --reload
   ```

4. Run the frontend from `frontend/nextjs_app`:

   ```bash
   cd frontend/nextjs_app
   npm install
   npm run dev
   ```

5. Open the dashboard in your browser at `http://localhost:3000` and point API calls to `http://localhost:8000`.

## Notes

- Backend CORS is enabled for local development.
- Use `.env.example` to create your own `.env` file with API keys and configuration.
- The frontend dashboard includes a command interface, memory panel, and agent status page.
