import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <nav className="flex gap-4 mb-8 text-sm text-slate-400">
          <Link href="/">Home</Link>
          <Link href="/voice">Voice</Link>
          <Link href="/memory">Memory</Link>
          <Link href="/agents">Agents</Link>
        </nav>
        <h1 className="text-3xl font-semibold mb-4">Settings</h1>
        <p className="text-slate-300 mb-6">
          Configure API keys, model selection, and preferences from this page.
        </p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400">Settings controls will appear here.</p>
        </div>
      </div>
    </main>
  );
}
