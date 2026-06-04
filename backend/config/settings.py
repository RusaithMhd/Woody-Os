import os


class Settings:
    def __init__(self):
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
        self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.PERSIST_DIR = os.getenv("WOODY_PERSIST_DIR", "./logs")
        self.CHROMA_DIR = os.getenv("WOODY_CHROMA_DIR", "./logs/chroma")
