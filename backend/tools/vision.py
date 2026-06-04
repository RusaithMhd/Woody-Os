from pathlib import Path


class VisionTool:
    def screenshot_text(self, image_path: str) -> str:
        try:
            from PIL import Image
            import pytesseract
        except ImportError:
            return "Vision tool unavailable. Install pillow and pytesseract."

        if not Path(image_path).exists():
            return "Image path does not exist."

        img = Image.open(image_path)
        return pytesseract.image_to_string(img)
