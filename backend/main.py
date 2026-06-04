from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import api_router
from backend.memory.sqlite_db import SQLiteMemory
from backend.memory.chroma_db import ChromaMemory
from backend.services.llm import LLMService
from backend.services.intent import IntentClassifier
from backend.services.voice import VoiceService

app = FastAPI(title="WOODY OS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization,Content-Type,Accept"
    return response

app.include_router(api_router, prefix="/api")

llm = LLMService()
intent_classifier = IntentClassifier()
sqlite_memory = SQLiteMemory()
chroma_memory = ChromaMemory()
voice_service = VoiceService()

active_connections: list[WebSocket] = []


@app.on_event("startup")
async def startup_event():
    print("WOODY OS backend starting...")


@app.on_event("shutdown")
async def shutdown_event():
    print("WOODY OS backend shutting down...")


@app.post("/command")
async def run_command(payload: dict):
    command = payload.get("command", "")
    if not command:
        return {"error": "No command provided"}

    intent = intent_classifier.classify(command)
    generated = llm.send_message(command)

    return {
        "command": command,
        "intent": intent,
        "response": generated,
    }


@app.post("/memory")
async def manage_memory(payload: dict):
    action = payload.get("action", "store")
    text = payload.get("text", "")
    query = payload.get("query", "")

    if action == "store":
        if not text:
            return {"error": "Memory text required for store action"}
        record_id = sqlite_memory.store_memory(text, payload.get("metadata", ""))
        chroma_memory.store_memory(text, metadata={"source": payload.get("source", "user")})
        return {"status": "stored", "id": record_id, "text": text}

    if action == "search":
        if not query:
            return {"error": "Query required for search action"}
        results = chroma_memory.recall_memory(query, n=5)
        return {"status": "found", "results": results}

    if action == "list":
        return {"status": "list", "memories": sqlite_memory.recall_memory(limit=20)}

    return {"status": "error", "message": "Unsupported memory action"}


@app.get("/status")
async def status():
    return {
        "status": "online",
        "agents": ["planner", "developer", "browser", "research", "vision"],
    }


@app.get("/agents")
async def agents():
    return {
        "available_agents": ["planner", "developer", "browser", "research", "vision"],
        "active_connections": len(active_connections),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            if not message:
                await websocket.send_json({"error": "Empty message"})
                continue

            intent = intent_classifier.classify(message)
            response = llm.send_message(message)
            await websocket.send_json({"message": response, "intent": intent})
    except WebSocketDisconnect:
        active_connections.remove(websocket)


@app.post("/workflow")
async def submit_workflow(payload: dict, background_tasks: BackgroundTasks):
    task_description = payload.get("task", "")
    if not task_description:
        return {"error": "Task description required"}

    from backend.agents.planner import TaskPlanner

    planner = TaskPlanner()
    task_graph = planner.break_down(task_description)
    background_tasks.add_task(llm.send_message, task_description)
    return {"status": "queued", "task_graph": task_graph}


@app.post("/voice/transcribe")
async def transcribe_audio(payload: dict):
    duration = float(payload.get("duration", 5.0))
    output_file = payload.get("output_file", "./logs/woody_input.wav")
    return voice_service.transcribe(duration=duration, output_file=output_file)


@app.post("/voice/upload")
async def upload_audio(file: UploadFile = File(...)):
    return voice_service.transcribe_file(file)


@app.post("/voice/speak")
async def speak_text(payload: dict):
    text = payload.get("text", "")
    return voice_service.speak(text)


@app.post("/voice/wakeword/start")
async def start_wakeword():
    return voice_service.start_wakeword()


@app.post("/voice/wakeword/stop")
async def stop_wakeword():
    return voice_service.stop_wakeword()


@app.get("/voice/status")
async def voice_status():
    return voice_service.wakeword_status()
