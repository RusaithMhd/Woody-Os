from pathlib import Path

file_path = Path('backend/services/llm.py')
text = file_path.read_text()
old = '''        payload = {
            "model": "llama3",
            "prompt": self._default_system_prompt() + "\\n\\n" + prompt,
            "temperature": 0.7,
            "max_new_tokens": 512,
        }
        response = requests.post(f"{self.ollama_url}/v1/generate", json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            return result.get("text", "").strip()
        return f"Ollama request failed: {response.status_code}'''
new = '''        payload = {
            "model": "llama3",
            "prompt": self._default_system_prompt() + "\\n\\n" + prompt,
            "temperature": 0.7,
            "max_new_tokens": 512,
        }

        try:
            response = requests.post(f"{self.ollama_url}/v1/generate", json=payload, timeout=30)
        except Exception as exc:
            return (
                "LLM connection failed. Check that Ollama is running on "
                f"{self.ollama_url} and that the service is reachable: {exc}"
            )

        if response.status_code != 200:
            return f"Ollama request failed: {response.status_code} - {response.text}"

        try:
            result = response.json()
            return result.get("text", "").strip()
        except Exception as exc:
            return f"Failed to parse Ollama response: {exc}'''
if old not in text:
    raise SystemExit('Old block not found in llm.py')
file_path.write_text(text.replace(old, new))
print('Patched llm.py successfully')
