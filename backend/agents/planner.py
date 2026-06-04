from typing import List


class TaskPlanner:
    def break_down(self, task_description: str) -> dict:
        sentences = [segment.strip() for segment in task_description.split(".") if segment.strip()]
        subtasks: List[dict] = []

        for index, sentence in enumerate(sentences, start=1):
            subtasks.append(
                {
                    "id": f"task_{index}",
                    "description": sentence,
                    "agent": self._select_agent(sentence),
                    "inputs": {"task": sentence},
                    "expected_output": "Summary or next step",
                }
            )

        return {
            "task": task_description,
            "subtasks": subtasks,
            "dependencies": [],
        }

    def _select_agent(self, sentence: str) -> str:
        lowered = sentence.lower()
        if any(keyword in lowered for keyword in ["search", "research", "summarize"]):
            return "research"
        if any(keyword in lowered for keyword in ["code", "build", "deploy", "program"]):
            return "developer"
        if any(keyword in lowered for keyword in ["open", "browse", "website", "login"]):
            return "browser"
        if any(keyword in lowered for keyword in ["screenshot", "ocr", "screen", "vision"]):
            return "vision"
        return "planner"
