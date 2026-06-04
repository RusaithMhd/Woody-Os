import requests

def test(path, payload):
    url = f"http://localhost:11434{path}"
    headers = {"Content-Type": "application/json"}
    r = requests.post(url, headers=headers, json=payload)
    print('PATH:', path)
    print('STATUS:', r.status_code)
    print('TEXT:', r.text)
    print('-' * 40)

payloads = [
    {"model": "llama3:latest", "input": "Hello"},
    {"model": "llama3:latest", "prompt": "Hello"},
    {"model": "llama3:latest", "messages": [{"role": "user", "content": "Hello"}]},
]
for payload in payloads:
    test('/v1/completions', payload)
    test('/v1/chat/completions', payload)
