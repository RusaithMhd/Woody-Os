"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function VoicePage() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCommand, setLoadingCommand] = useState(false);
  const [listening, setListening] = useState(false);
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
      setMessage("Woody is listening. Please say your requirement.");
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
    } catch (error) {
      setMessage("Unable to access speech recognition. Please allow microphone access and refresh.");
    }
  };

  const initVoiceFlow = async () => {
    keepListeningRef.current = true;
    setMessage("Initializing Woody voice assistant...");
    const greeting = language === "ta-IN"
      ? "வணக்கம்! நான் வூடிகே. தயவுசெய்து உங்கள் தேவையை கூறுங்கள்."
      : "Hello! I am Woody. Tell me your requirement when you are ready.";
    await speakText(greeting);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setMessage("Enter text to speak first.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8000/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMessage(data.status === "spoken" ? "Sent text to TTS engine." : JSON.stringify(data));
    } catch {
      setMessage("Unable to reach voice backend. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setMessage(null);
    setTranscript(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMessage("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        uploadAudioBlob(blob);
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
      setMessage("Recording... press Stop when finished.");
    } catch (error) {
      setMessage("Unable to access microphone. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const uploadAudioBlob = async (blob: Blob) => {
    setLoading(true);
    setMessage("Uploading audio...");

    const formData = new FormData();
    formData.append("file", blob, "woody_capture.webm");

    try {
      const res = await fetch("http://localhost:8000/voice/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "ok") {
        setTranscript(data.transcript);
        setMessage("Transcription complete.");
      } else {
        setMessage(JSON.stringify(data));
      }
    } catch (error) {
      setMessage("Failed to upload audio. Check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (command: string, restartAfterResponse = false) => {
    if (!command.trim()) {
      setMessage("No command available to send.");
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
        setMessage("Voice command sent to Woody.");
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
      setMessage("Unable to reach AI backend. Ensure the backend is running.");
    } finally {
      setLoadingCommand(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <nav className="flex gap-4 mb-8 text-sm text-slate-400">
          <Link href="/">Home</Link>
          <Link href="/memory">Memory</Link>
          <Link href="/agents">Agents</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <h1 className="text-3xl font-semibold mb-4">Voice</h1>
        <p className="text-slate-300 mb-6">Use the Voice panel to record audio, transcribe it, or send text to the TTS engine.</p>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="language" className="text-sm font-medium text-slate-300">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setLanguage(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="en-US">English</option>
            <option value="ta-IN">Tamil</option>
          </select>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Transcribe Audio</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={recording ? stopRecording : startRecording}
              className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
            <button
              onClick={() => {
                setAudioUrl(null);
                setTranscript(null);
                setMessage(null);
              }}
              className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              Reset
            </button>
          </div>

          {audioUrl && (
            <div className="mt-5">
              <p className="text-slate-300 mb-2">Playback recorded audio:</p>
              <audio controls src={audioUrl} className="w-full rounded-2xl bg-slate-950 p-3" />
            </div>
          )}

          {transcript && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <h3 className="text-lg font-semibold mb-2">Transcript</h3>
              <p className="whitespace-pre-wrap text-slate-200">{transcript}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => sendCommand(transcript)}
                  disabled={loadingCommand}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loadingCommand ? "Sending command..." : "Send as AI Command"}
                </button>
                <button
                  onClick={() => {
                    setTranscript(null);
                    setAudioUrl(null);
                    setAiResponse(null);
                    setMessage(null);
                  }}
                  className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
                >
                  Clear Transcript
                </button>
              </div>
            </div>
          )}

          {aiResponse && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <h3 className="text-lg font-semibold mb-2">Woody Response</h3>
              <p className="whitespace-pre-wrap text-slate-200">{aiResponse}</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Text-to-Speech</h2>
          <label htmlFor="voice-text" className="block text-sm text-slate-400 mb-2">
            Text to speak
          </label>
          <textarea
            id="voice-text"
            value={text}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setText(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter a phrase for Woody to speak..."
          />
          <button
            onClick={handleSpeak}
            disabled={loading}
            className="mt-4 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? "Speaking..." : "Speak"}
          </button>

          {message && <p className="mt-4 text-slate-300">{message}</p>}
        </section>
      </div>
    </main>
  );
}
