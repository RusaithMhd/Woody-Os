import sqlite3
from pathlib import Path


class SQLiteMemory:
    def __init__(self, db_path: str = "./logs/woody_memory.db"):
        self.db_path = db_path
        self._initialize()

    def _initialize(self):
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY, text TEXT, metadata TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )

    def store_memory(self, text: str, metadata: str = "") -> int:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "INSERT INTO memories (text, metadata) VALUES (?, ?)",
                (text, metadata),
            )
            return cursor.lastrowid

    def recall_memory(self, limit: int = 10) -> list[dict]:
        with sqlite3.connect(self.db_path) as conn:
            rows = conn.execute("SELECT id, text, metadata, created_at FROM memories ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [
            {"id": row[0], "text": row[1], "metadata": row[2], "created_at": row[3]} for row in rows
        ]
