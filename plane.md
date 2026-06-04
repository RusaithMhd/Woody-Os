# WOODY OS — AI-Optimized Build Prompt
> Use this prompt with Antigravity, Cursor, Claude Code, or any AI coding agent.

---

## 🧠 MASTER SYSTEM PROMPT

You are an expert full-stack AI systems engineer. Your task is to build **WOODY OS** — a personal AI operating system inspired by JARVIS. It is a voice-controlled, memory-powered, multi-agent automation platform that controls a PC, browses the web, writes code, and executes complex workflows autonomously.

---

## 🎯 PROJECT DEFINITION

**Project Name:** WOODY OS  
**Stack:** Python (backend) + React/Next.js (frontend)  
**AI Brain:** OpenAI API (primary) + Ollama (local fallback)  
**Voice:** faster-whisper (STT) + pyttsx3 (TTS) + custom wake word  
**Automation:** pyautogui + keyboard + psutil  
**Browser:** Playwright  
**Memory:** ChromaDB (vector) + SQLite/PostgreSQL (structured)  
**Agents:** LangChain + LangGraph + CrewAI  
**Vision:** OpenCV + Pillow + pytesseract  

---

## 📁 PROJECT STRUCTURE

Generate the following file/folder structure:

```
woody-os/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── api/
│   │   └── routes.py            # REST API routes
│   ├── agents/
│   │   ├── planner.py           # Task breakdown agent
│   │   ├── developer.py         # Code generation agent
│   │   ├── browser_agent.py     # Web automation agent
│   │   └── research_agent.py    # Search + summarize agent
│   ├── services/
│   │   ├── llm.py               # OpenAI / Ollama interface
│   │   ├── intent.py            # Command intent detection
│   │   └── executor.py          # Execution engine
│   ├── memory/
│   │   ├── chroma_db.py         # Vector memory (ChromaDB)
│   │   └── sqlite_db.py         # Structured memory (SQLite)
│   ├── tools/
│   │   ├── pc_control.py        # pyautogui + keyboard
│   │   └── vision.py            # Screen reading + OCR
│   └── config/
│       └── settings.py          # ENV + config loader
├── voice/
│   ├── stt.py                   # Speech-to-text (faster-whisper)
│   ├── tts.py                   # Text-to-speech (pyttsx3)
│   └── wakeword.py              # "Hey Woody" detection
├── automation/
│   ├── pc_control.py            # OS-level automation
│   └── browser.py               # Playwright browser agent
├── frontend/
│   └── nextjs_app/              # Next.js + Tailwind dashboard
├── logs/
├── .env
└── requirements.txt
```

---

## ⚙️ SYSTEM ARCHITECTURE

Build the following data flow pipeline:

```
USER INPUT (Voice / Text)
  → Voice Layer: STT + Wake Word Detection
  → Command Router: Intent Detection (LLM-based)
  → AI Brain: OpenAI GPT-4o / Ollama
  → Planner Agent: Task breakdown into subtasks
  → Agent Dispatcher:
      ├── Automation Agent  → pyautogui / keyboard / psutil
      ├── Browser Agent     → Playwright (login, scrape, apply)
      ├── Developer Agent   → Code generation + execution
      ├── Research Agent    → Web search + summarize
      └── Vision Agent      → Screenshot + OCR analysis
  → Memory System: ChromaDB + SQLite (read/write)
  → Execution Engine: Run actions, validate results
  → Voice Response: pyttsx3 TTS output
```

---

## 🔧 IMPLEMENTATION REQUIREMENTS

### 1. `backend/main.py`
- FastAPI app with CORS enabled
- WebSocket endpoint for real-time communication
- REST endpoints: `/command`, `/memory`, `/status`, `/agents`
- Background task runner for long-running agent workflows

### 2. `backend/services/llm.py`
- Unified LLM interface supporting both OpenAI (GPT-4o) and Ollama (llama3)
- System prompt that identifies as WOODY OS
- Streaming support for real-time token output
- Retry logic with exponential backoff

### 3. `backend/services/intent.py`
- Classify user command into intent categories:
  - `pc_control`, `browser`, `dev`, `research`, `memory`, `chat`, `vision`
- Return structured JSON: `{ intent, confidence, params }`
- Use function calling / structured output from LLM

### 4. `backend/agents/planner.py`
- Accept a high-level task string
- Use LLM to break into ordered subtasks
- Return task graph with dependencies
- Each subtask includes: `{ id, description, agent, inputs, expected_output }`

### 5. `backend/memory/chroma_db.py`
- Initialize ChromaDB persistent client
- Functions: `store_memory(text, metadata)`, `recall_memory(query, n=5)`
- Use embedding model: `all-MiniLM-L6-v2`
- Collections: `conversations`, `tasks`, `preferences`, `projects`

### 6. `automation/browser.py`
- Playwright async browser controller
- Functions:
  - `open_url(url)`
  - `fill_form(selectors_dict)`
  - `click_element(selector)`
  - `extract_text(selector)`
  - `screenshot(path)`
  - `apply_to_job(job_url, cv_path, cover_letter)`

### 7. `voice/stt.py`
- Use `faster-whisper` with model size `base`
- Capture audio from microphone using `sounddevice`
- Return transcribed text string
- Handle silence detection to auto-stop recording

### 8. `voice/wakeword.py`
- Listen continuously in background thread
- Trigger on phrase: "Hey Woody"
- Use simple energy + keyword detection or integrate `pvporcupine`
- On detection: play activation sound + start STT pipeline

### 9. `frontend/nextjs_app`
- Next.js 14 + Tailwind CSS dashboard
- Pages:
  - `/` — Main chat interface with voice input button
  - `/memory` — View stored memories, search, delete
  - `/agents` — Agent status, active tasks, logs
  - `/settings` — API keys, model selection, preferences
- Real-time WebSocket connection to backend
- Dark mode by default
- Responsive layout

---

## 🚀 PHASED BUILD PLAN

Build in this exact order. Do not skip phases:

### PHASE 1 — Core AI Chat (Week 1)
**Goal:** Text input → WOODY AI response  
**Files:** `main.py`, `llm.py`, `intent.py`  
**Validation:** Send "Hello Woody" → receive intelligent response

### PHASE 2 — Voice Layer (Week 2)
**Goal:** Speak → WOODY hears and responds with voice  
**Files:** `stt.py`, `tts.py`, `wakeword.py`  
**Validation:** Say "Hey Woody what time is it" → spoken response

### PHASE 3 — PC Control (Week 3)
**Goal:** WOODY controls the computer  
**Files:** `pc_control.py`, `automation agent`  
**Validation:** "Open VS Code" → VS Code launches

### PHASE 4 — Browser Automation (Week 4)
**Goal:** WOODY uses the web  
**Files:** `browser.py`, `browser_agent.py`  
**Validation:** "Search latest AI news" → results summarized

### PHASE 5 — Memory System (Week 5)
**Goal:** WOODY remembers context  
**Files:** `chroma_db.py`, `sqlite_db.py`  
**Validation:** "What is my business?" → "TRIWYN"

### PHASE 6 — Multi-Agent System (Month 2)
**Goal:** WOODY thinks as a team  
**Files:** `planner.py`, `developer.py`, `research_agent.py`  
**Validation:** "Research and summarize React 19 new features" → full report

### PHASE 7 — Vision System (Month 2–3)
**Goal:** WOODY sees the screen  
**Files:** `vision.py`  
**Validation:** "What's on my screen?" → accurate description

### PHASE 8 — Autonomous Execution (Month 3)
**Goal:** Full self-directed workflow engine  
**Files:** `executor.py`, updated `planner.py`  
**Validation:** "Apply to 5 frontend developer jobs on LinkedIn" → auto-executes

---

## 📦 DEPENDENCIES

Generate `requirements.txt` with:

```txt
# Core
openai
python-dotenv
fastapi
uvicorn
requests
httpx

# Voice
sounddevice
pyttsx3
faster-whisper

# Automation
pyautogui
psutil
keyboard

# Browser
playwright

# Memory
chromadb
sqlalchemy

# Agents
langchain
langchain-openai
langgraph
crewai

# Vision
opencv-python
pillow
pytesseract

# Utilities
numpy
scipy
```

---

## 🔐 ENVIRONMENT VARIABLES

Generate `.env.example`:

```env
OPENAI_API_KEY=your_openai_key_here
OLLAMA_BASE_URL=http://localhost:11434
WOODY_MODEL=gpt-4o
WOODY_VOICE=en-US
WAKE_WORD=hey woody
MEMORY_PATH=./memory/db
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:3000
```

---

## 🛡️ SECURITY REQUIREMENTS

- All commands pass through an intent validation layer before execution
- Destructive PC actions (delete, format) require confirmation
- Browser credentials stored encrypted using `cryptography` lib
- JWT auth on all FastAPI endpoints
- All agent actions logged to `./logs/activity.log`
- Sandbox file operations to `./workspace/` directory

---

## 📋 CODE QUALITY RULES

- All functions must have type hints
- All modules must have docstrings
- Use `async/await` throughout backend
- Error handling with meaningful error messages on all I/O operations
- Environment variables via `python-dotenv`, never hardcode keys
- Modular design — each agent/service must be independently testable

---

## ✅ STARTING POINT (PHASE 1 ONLY)

**For the first build session, implement ONLY:**

1. `backend/main.py` — FastAPI server with `/command` endpoint
2. `backend/services/llm.py` — OpenAI GPT-4o integration
3. `backend/services/intent.py` — Basic intent classifier
4. `backend/config/settings.py` — Env loader
5. `.env.example`
6. `requirements.txt`

**Test command:**
```bash
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello Woody, what can you do?"}'
```

**Expected response:**
```json
{
  "intent": "chat",
  "response": "I am WOODY OS, your personal AI assistant...",
  "confidence": 0.98
}
```

---

*Build phase by phase. Validate each phase before advancing. WOODY OS is built incrementally.*