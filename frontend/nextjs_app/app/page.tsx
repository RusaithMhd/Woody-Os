"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [loadingCommand, setLoadingCommand] = useState(false);
  const [language, setLanguage] = useState("ta-IN");
  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(true);
  const waitingForResultRef = useRef(false);

  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return SpeechRecognition ? new SpeechRecognition() : null;
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
    }

    try {
      await fetch("http://localhost:8000/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });
    } catch {
      // fallback silently if the backend is unavailable
    }
  };

  const sendCommand = async (command: string, restartAfterResponse = false) => {
    if (!command.trim()) {
      setMessage("No command detected. Please speak again.");
      return;
    }

    setLoadingCommand(true);
    setMessage(null);
    setAiResponse(null);

    try {
      const res = await fetch("http://localhost:8000/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();

      if (data.response) {
        setAiResponse(data.response);
        setMessage("Woody heard you and is responding.");
        await speakText(data.response);
        if (restartAfterResponse && keepListeningRef.current) {
          setTimeout(() => {
            if (keepListeningRef.current) {
              startSpeechRecognition();
            }
          }, 1200);
        }
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setMessage(JSON.stringify(data));
      }
    } catch {
      setMessage("Unable to reach the WOODY backend. Make sure the backend is running.");
    } finally {
      setLoadingCommand(false);
    }
  };

  const startSpeechRecognition = async () => {
    const recognitionInstance = getSpeechRecognition();
    if (!recognitionInstance) {
      setMessage("Speech recognition is not supported by this browser.");
      return;
    }

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setListening(true);
      setMessage("Woody is listening for your command.");
    };

    recognitionInstance.onerror = (event: any) => {
      const errorMessage = event.error ? `Speech recognition error: ${event.error}` : "Speech recognition failed.";
      setListening(false);
      setMessage(errorMessage);
    };

    recognitionInstance.onresult = async (event: any) => {
      const transcriptText = event.results?.[0]?.[0]?.transcript;
      if (!transcriptText) {
        setMessage("I could not understand that. Please try again.");
        setListening(false);
        waitingForResultRef.current = false;
        return;
      }

      setTranscript(transcriptText);
      setMessage("Processing your request. Woody will respond shortly.");
      setListening(false);
      waitingForResultRef.current = true;
      if (recognitionInstance.stop) {
        recognitionInstance.stop();
      }
      await sendCommand(transcriptText, true);
      waitingForResultRef.current = false;
    };

    recognitionInstance.onend = () => {
      setListening(false);
      if (!keepListeningRef.current) return;
      if (waitingForResultRef.current) return;

      setTimeout(() => {
        if (keepListeningRef.current) {
          startSpeechRecognition();
        }
      }, 600);
    };

    recognitionRef.current = recognitionInstance;

    try {
      recognitionInstance.start();
    } catch {
      setMessage("Unable to access speech recognition. Please allow microphone access and refresh.");
    }
  };

  const initVoiceFlow = async () => {
    keepListeningRef.current = true;
    setMessage("Starting Woody voice-first experience...");
    const greetingText =
      language === "ta-IN"
        ? "வணக்கம்! நான் வூடி. உங்கள் தேவையை தமிழில் சொல்லுங்கள்."
        : "Hello! I am Woody. Tell me your requirement when you are ready.";
    await speakText(greetingText);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await startSpeechRecognition();
  };

  useEffect(() => {
    initVoiceFlow();
    return () => {
      keepListeningRef.current = false;
      if (recognitionRef.current && typeof recognitionRef.current.stop === "function") {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Woody OS</h1>
          <p className="text-slate-400 max-w-2xl">
            Voice-first AI assistant — speak your requirement and Woody will respond out loud.
          </p>
        </header>

        <nav className="flex flex-wrap gap-3 mb-8">
          <Link className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 hover:bg-slate-800" href="/voice">
            Voice Panel
          </Link>
          <Link className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 hover:bg-slate-800" href="/memory">
            Memory
          </Link>
          <Link className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 hover:bg-slate-800" href="/agents">
            Agents
          </Link>
          <Link className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 hover:bg-slate-800" href="/settings">
            Settings
          </Link>
        </nav>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Voice-first Landing</h2>
          <p className="text-slate-400 mb-4">
            Your experience begins here. Woody greets you automatically and keeps listening for your spoken request without pressing the mic.
          </p>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label htmlFor="language-select" className="text-sm text-slate-400">
              Select language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setMessage(
                  event.target.value === "ta-IN"
                    ? "தமிழில் பேசுங்கள். Woody உங்கள் பதிலை தமிழ் மொழியில் வழங்கும்."
                    : "Switching to English. Woody will speak and listen in English."
                );
              }}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ta-IN">தமிழ்</option>
              <option value="en-US">English</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-medium text-white">{listening ? "Listening..." : "Waiting for voice"}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Transcript</p>
              <p className="mt-2 text-lg font-medium text-slate-100">{transcript || "No speech captured yet."}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                setTranscript(null);
                setAiResponse(null);
                setMessage("Ready for your next command.");
              }}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>

          {message && <p className="mt-4 text-slate-300">{message}</p>}
          {aiResponse && (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <h3 className="text-lg font-semibold mb-2">Woody Response</h3>
              <p className="whitespace-pre-wrap text-slate-200">{aiResponse}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
