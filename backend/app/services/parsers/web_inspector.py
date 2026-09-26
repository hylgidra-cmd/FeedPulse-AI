import httpx
import re
from typing import Dict, Any, List
from urllib.parse import urlparse

async def inspect_website_content(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True, headers=headers) as client:
            response = await client.get(url)
            html = response.text
            final_url = str(response.url)
    except Exception as e:
        return {
            "success": False,
            "url": url,
            "site_title": "",
            "is_educational": False,
            "detected_courses": [],
            "reviews_found": [],
            "has_reviews": False,
            "error": f"Saytga ulanib bo'lmadi: {str(e)}",
            "diagnostic_message": f"Saytga kirishda xatolik yuz berdi ({str(e)}). Iltimos, URL to'g'ri kiritilganligini tekshiring."
        }

    # 1. Extract Title & Meta
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.I | re.S)
    site_title = title_match.group(1).strip() if title_match else urlparse(final_url).netloc
    site_title = re.sub(r'\s+', ' ', site_title)

    desc_match = re.search(r'<meta[^>]*name=[\"\']description[\"\'][^>]*content=[\"\'](.*?)[\"\']', html, re.I | re.S)
    site_description = desc_match.group(1).strip() if desc_match else ""

    # 2. Check for connected backends (e.g. onrender / api endpoints)
    detected_courses = []
    backends = re.findall(r'https?://[a-zA-Z0-9\.\-]+\.onrender\.com', html)

    async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, headers=headers) as client:
        # Check detected backends for /api/courses
        for b in set(backends):
            try:
                c_res = await client.get(f"{b}/api/courses")
                if c_res.status_code == 200:
                    c_data = c_res.json()
                    items = c_data.get("data", {}).get("items", []) if isinstance(c_data, dict) else []
                    for it in items:
                        t = it.get("title")
                        sub = it.get("subtitle", "")
                        dur = it.get("durationMonths")
                        dur_str = f" ({dur} oy)" if dur else ""
                        if t:
                            detected_courses.append(f"{t}{dur_str}")
            except Exception:
                pass

    # 3. Check keywords for educational / course sites
    lower_text = html.lower()
    edu_keywords = ["kurs", "course", "dasturlash", "mentor", "talaba", "video", "dars", "ta'lim", "oqıw", "oqiw"]
    is_educational = any(kw in lower_text for kw in edu_keywords) or len(detected_courses) > 0

    # 4. Search for reviews/testimonials
    reviews_found = []
    
    # Check if there are testimonials in connected backend
    for b in set(backends):
        try:
            async with httpx.AsyncClient(timeout=5.0, headers=headers) as client:
                t_res = await client.get(f"{b}/api/testimonials")
                if t_res.status_code == 200:
                    t_data = t_res.json()
                    items = t_data.get("data", []) if isinstance(t_data, dict) else []
                    for t_item in items:
                        content = t_item.get("text") or t_item.get("content")
                        if content and len(content) > 10:
                            reviews_found.append({
                                "content": content,
                                "author_name": t_item.get("name") or t_item.get("author") or "O'quvchi",
                                "rating": t_item.get("rating") or 5,
                                "source": f"web:{urlparse(final_url).netloc}"
                            })
        except Exception:
            pass

    has_reviews = len(reviews_found) > 0

    # 5. Formulate Diagnostic Message
    if has_reviews:
        diagnostic_message = f"Muvaffaqiyatli: Saytdan {len(reviews_found)} ta real sharh va izoh topildi va tahlilga kiritish uchun tayyorlandi."
    else:
        courses_part = f" Saytda {len(detected_courses)} ta kurs ({', '.join(detected_courses[:4])}...) aniqlandi." if detected_courses else ""
        diagnostic_message = (
            f"Ushbu saytda ({final_url}) ochiq mijoz sharhlari yoki izohlar (reviews/comments) topilmadi.{courses_part} "
            f"Saytda sharhlar tizimi bo'lmagani sababli, sharhlarni yig'ish uchun loyihangizga biriktirilgan API Key yoki Webhook-dan foydalanishingiz mumkin."
        )

    return {
        "success": True,
        "url": final_url,
        "site_title": site_title,
        "site_description": site_description,
        "is_educational": is_educational,
        "detected_courses": detected_courses,
        "reviews_found": reviews_found,
        "has_reviews": has_reviews,
        "diagnostic_message": diagnostic_message
    }
