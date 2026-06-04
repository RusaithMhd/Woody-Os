import os

try:
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
except ImportError:
    chromadb = None
    SentenceTransformer = None


class ChromaMemory:
    def __init__(self, persist_directory: str = "./logs/chroma"):
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None
        self._initialize()

    def _initialize(self):
        if chromadb is None or SentenceTransformer is None:
            self.client = None
            return

        try:
            self.client = chromadb.Client(Settings(persist_directory=self.persist_directory, is_persistent=True))
            self.collection = self.client.get_or_create_collection("woody_memory")
        except Exception as exc:
            print("Warning: ChromaDB initialization failed:", exc)
            self.client = None
            self.collection = None

    def store_memory(self, text: str, metadata: dict[str, str] | None = None) -> dict:
        if self.client is None:
            return {"status": "disabled", "message": "ChromaDB not installed."}

        self.collection.add(
            documents=[text],
            metadatas=[metadata or {}],
            ids=[f"memory-{int(os.times().system)}"],
        )
        self.client.persist()
        return {"status": "stored", "text": text}

    def recall_memory(self, query: str, n: int = 5) -> list[dict]:
        if self.client is None:
            return []

        results = self.collection.query(query_texts=[query], n_results=n)
        return [
            {"id": rid, "text": doc, "metadata": meta}
            for rid, doc, meta in zip(results["ids"][0], results["documents"][0], results["metadatas"][0])
        ]
