import subprocess
import platform


class PCControl:
    def open_application(self, name: str) -> dict:
        system = platform.system().lower()
        if system == "windows":
            try:
                subprocess.Popen([name])
                return {"status": "launched", "application": name}
            except Exception as exc:
                return {"status": "error", "error": str(exc)}
        return {"status": "unsupported", "platform": system}

    def screenshot(self, path: str = "./logs/screenshot.png") -> dict:
        try:
            import pyautogui
        except ImportError:
            return {"status": "error", "message": "pyautogui not installed"}

        pyautogui.screenshot(path)
        return {"status": "saved", "path": path}
