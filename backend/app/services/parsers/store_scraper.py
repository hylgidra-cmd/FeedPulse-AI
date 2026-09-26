import httpx
from typing import List, Dict, Any, Tuple

async def _fetch_single_store(app_id: str, country: str) -> Tuple[List[Dict[str, Any]], int, int]:
    url = f"https://itunes.apple.com/{country}/rss/customerreviews/id={app_id}/sortBy=mostRecent/json"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url)
        if response.status_code != 200:
            return [], 0, 0
        data = response.json()

    feed = data.get("feed", {})
    entries = feed.get("entry", [])
    review_entries = [e for e in entries if "author" in e]
    total_parsed = len(review_entries)
    ignored_short = 0
    valid_items = []

    for entry in review_entries:
        content = entry.get("content", {}).get("label", "").strip()
        title = entry.get("title", {}).get("label", "").strip()
        full_text = f"{title}. {content}" if title else content
        if len(full_text) < 15:
            ignored_short += 1
            continue
        try:
            rating = int(entry.get("im:rating", {}).get("label", "3"))
        except ValueError:
            rating = 3
        author_name = entry.get("author", {}).get("name", {}).get("label", "App Store User")
        sentiment = "neutral"
        if rating <= 2:
            sentiment = "negative"
        elif rating >= 4:
            sentiment = "positive"
        valid_items.append({
            "content": full_text,
            "rating": rating,
            "sentiment": sentiment,
            "author_name": author_name,
            "source": f"app_store_{country}"
        })
    return valid_items, total_parsed, ignored_short

async def fetch_app_store_reviews(app_id: str, country: str = "us") -> Tuple[List[Dict[str, Any]], int, int]:
    items, total, ignored = await _fetch_single_store(app_id, country)
    # If regional store has 0 reviews, fall back to global US store
    if not items and country != "us":
        items, total, ignored = await _fetch_single_store(app_id, "us")
    return items, total, ignored
