try:
    import pyttsx3
except ImportError:
    pyttsx3 = None


class TextToSpeech:
    def __init__(self):
        self.engine = pyttsx3.init() if pyttsx3 else None

    def speak(self, text: str) -> dict:
        if self.engine is None:
            return {"status": "error", "message": "pyttsx3 not installed"}

        self.engine.say(text)
        self.engine.runAndWait()
        return {"status": "spoken", "text": text}
