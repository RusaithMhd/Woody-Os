import os
import time
from typing import Any

try:
    import openai
except ImportError:
    openai = None


class LLMService:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        self.ollama_model = os.getenv('OLLAMA_MODEL', 'llama3:latest')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4o')

    def _default_system_prompt(self) -> str:
        return (
            'You are WOODY OS, an autonomous AI operating system agent. '
            'Answer user requests succinctly and clearly.'
        )

    def send_message(self, prompt: str) -> str:
        if self.openai_key and openai:
            try:
                return self._send_openai(prompt)
            except Exception:
                return self._send_ollama(prompt)
        return self._send_ollama(prompt)

    def _send_openai(self, prompt: str) -> str:
        openai.api_key = self.openai_key
        retry = 0
        while retry < 3:
            try:
                response = openai.ChatCompletion.create(
                    model=self.model,
                    messages=[
                        {'role': 'system', 'content': self._default_system_prompt()},
                        {'role': 'user', 'content': prompt},
                    ],
                    temperature=0.7,
                )
                return response.choices[0].message.content.strip()
            except Exception as exc:
                retry += 1
                time.sleep(2 ** retry)
        raise RuntimeError('OpenAI request failed after retries')

    def _send_ollama(self, prompt: str) -> str:
        try:
            import requests
        except ImportError:
            return 'LLM service unavailable. Install requests or configure OpenAI API key.'

        payload = {
            'model': self.ollama_model,
            'prompt': self._default_system_prompt() + '\n\n' + prompt,
            'temperature': 0.7,
            'max_new_tokens': 512,
        }

        try:
            response = requests.post(f'{self.ollama_url}/v1/completions', json=payload, timeout=30)
        except Exception as exc:
            return (
                'LLM connection failed. Check that Ollama is running on '
                f'{self.ollama_url} and that the service is reachable: {exc}'
            )

        if response.status_code != 200:
            return f'Ollama request failed: {response.status_code} - {response.text}'

        try:
            result = response.json()
            if 'choices' in result and result['choices']:
                return result['choices'][0].get('text', '').strip()
            return result.get('text', '').strip()
        except Exception as exc:
            return f'Failed to parse Ollama response: {exc}'
