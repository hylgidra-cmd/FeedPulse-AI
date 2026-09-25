import json
import re
from typing import List, Dict, Any
from app.core.config import settings

SYSTEM_PROMPT = """Siz Senior Product Manager yordamchisisiz. Quyida bir xil muammoga tegishli bo'lgan foydalanuvchi sharhlari to'plami berilgan.
Vazifangiz:
1. Muammoga aniq, qisqa nom bering (title).
2. Ildiz sababni va foydalanuvchilarning asosiy talabini yozing (root_cause).
3. Ushbu muammoni hal qilish uchun dasturchilar jamoasiga tayyor Jira Task (Markdown) yozib bering (Acceptance Criteria bilan).

JAVOBNI FAQAT QUYIDAGI JSON FORMATIDA BERING:
{
  "title": "Qisqa nom",
  "root_cause": "Ildiz sabab tavsifi",
  "severity": "critical",
  "jira_markdown": "Jira uchun markdown matni"
}"""

def _clean_json_response(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        text = match.group(1)
    else:
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1:
            text = text[first_brace:last_brace + 1]
    return json.loads(text)

def _generate_offline_cluster_summary(feedbacks: List[Dict[str, Any]]) -> Dict[str, Any]:
    first_few = [f.get("content", "") for f in feedbacks[:3]]
    preview = " / ".join(first_few)[:120]
    
    title = f"Takrorlanuvchi muammo: {first_few[0][:50]}..." if first_few else "Foydalanuvchi shikoyati"
    root_cause = f"Foydalanuvchilar shikoyat qilgan asosiy sabab: {preview}"
    
    feedback_lines = []
    for f in feedbacks[:5]:
        content_txt = f.get("content", "")
        feedback_lines.append(f'- *"{content_txt}"*')
    sample_text = "\n".join(feedback_lines)

    jira_md = f"""## [BUG/TASK] {title}

### Tavsif
Foydalanuvchilar quyidagi asosiy muammoga duch kelishmoqda:
{preview}

### Foydalanuvchilar sharhlaridan namunalar:
{sample_text}

### Acceptance Criteria
- [ ] Muammoning ildiz sababi aniqlansin va texnik xato bartaraf etilsin
- [ ] Tegishli regressiya testlari yozilsin
- [ ] Mahsulot menejeri (PM) tomonidan qabul qilinsin
"""
    return {
        "title": title,
        "root_cause": root_cause,
        "severity": "high",
        "jira_markdown": jira_md
    }

async def summarize_cluster(feedbacks: List[Dict[str, Any]]) -> Dict[str, Any]:
    reviews_text = "\n".join([
        f"- Rating: {f.get('rating', 'N/A')}/5 | Sharh: {f.get('content')}"
        for f in feedbacks[:8]
    ])

    user_prompt = f"Klasterga tegishli foydalanuvchi sharhlari:\n{reviews_text}\n\nIltimos, yuqoridagi qat'iy JSON formatida javob bering."

    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_"):
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            chat_completion = await client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                model=settings.GROQ_MODEL,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw_content = chat_completion.choices[0].message.content
            return _clean_json_response(raw_content)
        except Exception as e:
            print(f"[Summarizer Warning] Groq failed: {e}. Checking OpenAI fallback.")

    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            raw_content = response.choices[0].message.content
            return _clean_json_response(raw_content)
        except Exception as e:
            print(f"[Summarizer Warning] OpenAI failed: {e}. Falling back to offline generator.")

    return _generate_offline_cluster_summary(feedbacks)
