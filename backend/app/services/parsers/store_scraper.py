import httpx
from typing import List, Dict, Any, Tuple

async def fetch_app_store_reviews(app_id: str, country: str = "us") -> Tuple[List[Dict[str, Any]], int, int]:
    # Try the requested country first, then fallback to high-volume countries
    fallback_countries = [country, "ca", "gb", "us", "au", "de"]
    seen_countries = set()
    ordered_countries = [c for c in fallback_countries if not (c in seen_countries or seen_countries.add(c))]

    review_entries = []
    async with httpx.AsyncClient(timeout=15.0) as client:
        for c in ordered_countries:
            url = f"https://itunes.apple.com/{c}/rss/customerreviews/id={app_id}/sortBy=mostRecent/json"
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    feed = data.get("feed", {})
                    entries = feed.get("entry", [])
                    found = [e for e in entries if "author" in e]
                    if found:
                        review_entries = found
                        break
            except Exception:
                continue

    if not review_entries:
        return [], 0, 0

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
            "source": "app_store"
        })
    return valid_items, total_parsed, ignored_short
