"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentsPage() {
  const [agents, setAgents] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("http://localhost:8000/agents");
      const data = await res.json();
      setAgents(data.available_agents || []);
    } catch (error) {
      setStatus("Unable to load agent status. Ensure the backend is running.");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <nav className="flex gap-4 mb-8 text-sm text-slate-400">
          <Link href="/">Home</Link>
          <Link href="/voice">Voice</Link>
          <Link href="/memory">Memory</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <h1 className="text-3xl font-semibold mb-4">Agents</h1>
        <p className="text-slate-300 mb-6">Monitor agent status, active tasks, and logs from the backend.</p>

        {status && <p className="mb-4 text-slate-400">{status}</p>}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Agents</h2>
            <button
              onClick={fetchAgents}
              className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Refresh
            </button>
          </div>
          {agents.length === 0 ? (
            <p className="text-slate-500">No agents detected yet.</p>
          ) : (
            <ul className="space-y-3">
              {agents.map((agent) => (
                <li key={agent} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-slate-100 font-medium">{agent}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
