"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function MemoryPage() {
  const [memories, setMemories] = useState<Array<{ id: number; text: string; metadata: string; created_at: string }>>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const loadMemories = async () => {
    try {
      const res = await fetch("http://localhost:8000/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (error) {
      setStatus("Unable to load memories. Ensure the backend is running.");
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const storeMemory = async () => {
    if (!newMemory.trim()) return;
    const res = await fetch("http://localhost:8000/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "store", text: newMemory, metadata: "web" }),
    });
    const data = await res.json();
    setStatus(data.status === "stored" ? "Memory stored successfully." : "Failed to store memory.");
    setNewMemory("");
    await loadMemories();
  };

  const searchMemory = async () => {
    if (!query.trim()) return;
    const res = await fetch("http://localhost:8000/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "search", query }),
    });
    const data = await res.json();
    setSearchResults(data.results || []);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <nav className="flex gap-4 mb-8 text-sm text-slate-400">
          <Link href="/">Home</Link>
          <Link href="/voice">Voice</Link>
          <Link href="/agents">Agents</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <h1 className="text-3xl font-semibold mb-4">Memory</h1>
        <p className="text-slate-300 mb-6">
          Store new memories and search the vector-backed memory database.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Add Memory</h2>
            <textarea
              value={newMemory}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNewMemory(event.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Remember this text for later..."
            />
            <button
              onClick={storeMemory}
              className="mt-4 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Save Memory
            </button>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Search Memories</h2>
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Search memory store..."
              />
              <button
                onClick={searchMemory}
                className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-5 space-y-3">
                {searchResults.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <p className="text-slate-200">{item.text}</p>
                    <p className="mt-2 text-xs text-slate-500">Source: {item.metadata?.source || "unknown"}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Memories</h2>
          {status && <p className="mb-4 text-slate-300">{status}</p>}
          <div className="space-y-4">
            {memories.length === 0 ? (
              <p className="text-slate-500">No memories yet. Store one above to begin.</p>
            ) : (
              memories.map((memory) => (
                <article key={memory.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-slate-200">{memory.text}</p>
                  <p className="mt-2 text-xs text-slate-500">Created: {new Date(memory.created_at).toLocaleString()}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
