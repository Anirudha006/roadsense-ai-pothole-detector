import json

with open(r'c:\Users\srini\.gemini\antigravity\brain\d2836d56-7b9b-4b94-87b3-811396630cbb\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        content = data.get('content', '')
        if '4MH24' in content or 'Anirudha' in content or 'Madhava' in content:
            print(f"Step {data.get('step_index')}: {content[:300]}...\n")
