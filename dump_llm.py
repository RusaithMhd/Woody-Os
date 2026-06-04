from pathlib import Path
p = Path('backend/services/llm.py')
text = p.read_text()
lines = text.splitlines()
chunk = '\n'.join(lines[56:66])
print(repr(chunk))
print('---')
print(chunk)
