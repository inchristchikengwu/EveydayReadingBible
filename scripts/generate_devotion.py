import json
import os
import sys
from datetime import datetime, timezone, timedelta
from urllib import request, error

API_KEY = os.environ.get('OPENAI_API_KEY')
MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4.1-mini')
if not API_KEY:
    print('Missing OPENAI_API_KEY', file=sys.stderr)
    sys.exit(1)

tw_today = datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d')

schema = {
    "type": "object",
    "additionalProperties": False,
    "required": ["date", "title", "scripture", "meditation", "practice", "prayer", "hymn", "sentence"],
    "properties": {
        "date": {"type": "string"},
        "title": {"type": "object", "additionalProperties": False, "required": ["zh", "en"], "properties": {"zh": {"type": "string"}, "en": {"type": "string"}}},
        "scripture": {"type": "object", "additionalProperties": False, "required": ["reference", "rcuv", "esv"], "properties": {"reference": {"type": "string"}, "rcuv": {"type": "string"}, "esv": {"type": "string"}}},
        "meditation": {"type": "object", "additionalProperties": False, "required": ["zh", "en"], "properties": {"zh": {"type": "string"}, "en": {"type": "string"}}},
        "practice": {"type": "object", "additionalProperties": False, "required": ["zh", "en"], "properties": {"zh": {"type": "string"}, "en": {"type": "string"}}},
        "prayer": {"type": "object", "additionalProperties": False, "required": ["zh", "en"], "properties": {"zh": {"type": "string"}, "en": {"type": "string"}}},
        "hymn": {"type": "object", "additionalProperties": False, "required": ["title_zh", "title_en", "relation_zh", "relation_en"], "properties": {"title_zh": {"type": "string"}, "title_en": {"type": "string"}, "relation_zh": {"type": "string"}, "relation_en": {"type": "string"}}},
        "sentence": {"type": "object", "additionalProperties": False, "required": ["zh", "en"], "properties": {"zh": {"type": "string"}, "en": {"type": "string"}}}
    }
}

prompt = f"""
今天日期：{tw_today}（Asia/Taipei）。
請生成一篇基督教靈修短文，風格要接近 ChatGPT 每日生成的「今日基督教靈修」：有經文脈絡、基督中心、簡短但有深度，不要空泛勵志。

要求：
1. 使用繁體中文為主，並提供英文對照。
2. 今日經文：列出一段核心經文；中文使用「和合本修訂版 RCUV」短節選，英文使用 ESV 短節選。避免長篇引用，每個版本引用盡量控制在一節或短片語。
3. 今日默想：中英對照。中文約 500-800 字；英文約 200-350 字。須重視上下文、福音、與基督聯合或恩典；神學取向優先福音派／改革宗，也可適度納入恢復傳統、倪柝聲、李常受相關亮光，但不可取代聖經本身。
4. 今日可實行的操練：中英對照，要具體、可做。
5. 今日禱告：中英對照，各一段，結尾阿們/Amen。
6. 今日詩歌：列出中文歌名、常見英文歌名，並中英對照說明它與今日經文或主題的關聯。
7. 今日一句話：中英對照，精煉有力。
8. 不要輸出 Markdown，只輸出符合 JSON schema 的內容。
"""

payload = {
    "model": MODEL,
    "input": [
        {"role": "system", "content": "You are a careful bilingual Christian devotional writer. Follow the user's theological and formatting requirements precisely."},
        {"role": "user", "content": prompt}
    ],
    "text": {
        "format": {
            "type": "json_schema",
            "name": "daily_devotion",
            "schema": schema,
            "strict": True
        }
    }
}

data = json.dumps(payload).encode('utf-8')
req = request.Request(
    'https://api.openai.com/v1/responses',
    data=data,
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    },
    method='POST'
)
try:
    with request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode('utf-8'))
except error.HTTPError as e:
    print(e.read().decode('utf-8'), file=sys.stderr)
    raise

text = None
if 'output_text' in result:
    text = result['output_text']
else:
    for item in result.get('output', []):
        for content in item.get('content', []):
            if content.get('type') == 'output_text':
                text = content.get('text')
                break
        if text:
            break
if not text:
    raise RuntimeError('No output text returned by OpenAI API')

devotion = json.loads(text)
os.makedirs('data/archive', exist_ok=True)
with open('data/today.json', 'w', encoding='utf-8') as f:
    json.dump(devotion, f, ensure_ascii=False, indent=2)
with open(f'data/archive/{tw_today}.json', 'w', encoding='utf-8') as f:
    json.dump(devotion, f, ensure_ascii=False, indent=2)
print(f'Generated devotion for {tw_today}')
