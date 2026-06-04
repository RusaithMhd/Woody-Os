import os

try:
    from faster_whisper import WhisperModel
    import sounddevice as sd
    import numpy as np
    from scipy.io.wavfile import write as write_wav
except ImportError:
    WhisperModel = None
    sd = None
    np = None


class SpeechToText:
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
        if WhisperModel is not None:
            try:
                self.model = WhisperModel(self.model_size, device="cpu")
            except Exception as exc:
                print(f"Warning: faster-whisper model failed to initialize: {exc}")
                self.model = None

    def record_audio(self, duration: float = 5.0, sample_rate: int = 16000, output_file: str = "./logs/woody_input.wav") -> str:
        if sd is None or np is None:
            return "Audio recording unavailable. Install sounddevice and numpy."

        recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype="int16")
        sd.wait()
        write_wav(output_file, sample_rate, recording)
        return output_file

    def transcribe(self, audio_path: str) -> str:
        if self.model is None:
            return "STT model unavailable. Install faster-whisper or check model initialization."

        try:
            segments, info = self.model.transcribe(audio_path)
            return " ".join(segment.text for segment in segments)
        except Exception as exc:
            return f"STT transcription failed: {exc}"
