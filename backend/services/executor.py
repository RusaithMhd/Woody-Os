import asyncio


class ExecutionEngine:
    async def execute(self, task: dict) -> dict:
        await asyncio.sleep(0.1)
        return {"status": "executed", "task": task}

    def validate(self, task_output: dict) -> bool:
        return True
