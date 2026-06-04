from typing import Any

from voice.stt import SpeechToText
from voice.tts import TextToSpeech
from voice.wakeword import WakeWordListener


class VoiceService:
    def __init__(self):
        self.stt = SpeechToText()
        self.tts = TextToSpeech()
        self.wakeword = WakeWordListener()

    def transcribe(self, duration: float = 5.0, output_file: str = "./logs/woody_input.wav") -> dict[str, Any]:
        recorded = self.stt.record_audio(duration=duration, output_file=output_file)
        if recorded.startswith("Audio recording unavailable"):
            return {"status": "error", "message": recorded}

        transcript = self.stt.transcribe(output_file)
        return {"status": "ok", "transcript": transcript}

    def transcribe_file(self, upload_file) -> dict[str, Any]:
        destination_path = f"./logs/{upload_file.filename}"
        try:
            with open(destination_path, "wb") as out_file:
                out_file.write(upload_file.file.read())

            transcript = self.stt.transcribe(destination_path)
            if transcript.startswith("STT transcription failed") or transcript.startswith("STT model unavailable"):
                return {"status": "error", "message": transcript, "path": destination_path}
            return {"status": "ok", "transcript": transcript, "path": destination_path}
        except Exception as exc:
            return {"status": "error", "message": f"Failed to process audio upload: {exc}", "path": destination_path}

    def speak(self, text: str) -> dict[str, Any]:
        if not text:
            return {"status": "error", "message": "No text provided"}
        return self.tts.speak(text)

    def start_wakeword(self, callback=None) -> dict[str, Any]:
        if self.wakeword._running:
            return {"status": "already_running"}

        def notifier():
            if callback:
                callback("wakeword detected")

        self.wakeword.start(notifier)
        return {"status": "started", "keyword": self.wakeword.keyword}

    def stop_wakeword(self) -> dict[str, Any]:
        self.wakeword.stop()
        return {"status": "stopped"}

    def wakeword_status(self) -> dict[str, Any]:
        return {"status": "ok", "running": self.wakeword._running}
