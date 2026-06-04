import threading
import time


class WakeWordListener:
    def __init__(self, keyword: str = "hey woody"):
        self.keyword = keyword.lower()
        self._running = False
        self._thread = None

    def start(self, callback):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._listen_loop, args=(callback,), daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=1.0)

    def _listen_loop(self, callback):
        while self._running:
            time.sleep(1.0)
            # Placeholder: integrate a real wake-word detector here.
            # This example does not access the microphone by default.
            pass
