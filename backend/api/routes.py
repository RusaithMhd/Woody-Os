from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/health")
def health_check():
    return {"status": "healthy"}


@api_router.post("/command")
def command_route(payload: dict):
    return {"status": "not implemented", "payload": payload}


@api_router.get("/agents")
def agents_route():
    return {"agents": ["planner", "developer", "browser", "research", "vision"]}
