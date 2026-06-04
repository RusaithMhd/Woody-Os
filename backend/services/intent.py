import re

INTENT_KEYWORDS = {
    "pc_control": ["open", "launch", "close", "shutdown", "restart", "click", "type"],
    "browser": ["search", "browse", "open website", "website", "login", "apply", "scrape"],
    "dev": ["code", "build", "develop", "program", "run tests", "deploy"],
    "research": ["research", "summarize", "find", "learn", "investigate"],
    "memory": ["remember", "forget", "recall", "note", "memory"],
    "chat": ["hello", "hi", "hey", "talk", "chat", "how are"],
    "vision": ["screen", "read", "capture", "ocr", "image", "vision"],
}


class IntentClassifier:
    def classify(self, text: str) -> dict:
        normalized = text.lower()
        scores = {intent: 0 for intent in INTENT_KEYWORDS}

        for intent, terms in INTENT_KEYWORDS.items():
            for term in terms:
                if term in normalized:
                    scores[intent] += 1

        best_intent = max(scores, key=scores.get)
        confidence = float(scores[best_intent]) / max(sum(scores.values()), 1)
        return {
            "intent": best_intent,
            "confidence": round(confidence, 2),
            "params": self._extract_params(normalized),
        }

    def _extract_params(self, text: str) -> dict:
        urls = re.findall(r"https?://\S+", text)
        return {"urls": urls, "raw_text": text}
