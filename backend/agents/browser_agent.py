class BrowserAgent:
    def __init__(self):
        self.name = "browser"

    async def open_url(self, url: str) -> dict:
        return {"status": "ok", "url": url, "message": "Opened URL placeholder."}

    async def apply_to_job(self, job_url: str, cv_path: str, cover_letter: str) -> dict:
        return {"status": "queued", "job_url": job_url}
