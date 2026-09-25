import io
import pandas as pd
from typing import List, Dict, Any, Tuple

def parse_feedback_csv(file_bytes: bytes) -> Tuple[List[Dict[str, Any]], int, int]:
    try:
        df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(file_bytes), encoding="latin-1")
    
    total_parsed = len(df)
    ignored_short = 0
    valid_items = []

    col_map = {col: col.strip().lower() for col in df.columns}
    df = df.rename(columns=col_map)

    content_col = None
    for candidate in ["content", "review", "text", "comment", "feedback", "body", "description", "message"]:
        if candidate in df.columns:
            content_col = candidate
            break
    
    if not content_col:
        for col in df.columns:
            if df[col].dtype == object:
                content_col = col
                break

    if not content_col:
        raise ValueError("Could not find a valid content/review column in the uploaded CSV.")

    rating_col = None
    for candidate in ["rating", "score", "stars", "star_rating"]:
        if candidate in df.columns:
            rating_col = candidate
            break

    author_col = None
    for candidate in ["author", "author_name", "user", "username", "name"]:
        if candidate in df.columns:
            author_col = candidate
            break

    for _, row in df.iterrows():
        raw_content = str(row[content_col]).strip() if pd.notna(row[content_col]) else ""
        
        if len(raw_content) < 15 or raw_content.lower() in ["nan", "null", "none"]:
            ignored_short += 1
            continue

        rating = None
        if rating_col and pd.notna(row[rating_col]):
            try:
                parsed_rating = int(float(row[rating_col]))
                if 1 <= parsed_rating <= 5:
                    rating = parsed_rating
            except (ValueError, TypeError):
                rating = None

        sentiment = "neutral"
        if rating is not None:
            if rating <= 2:
                sentiment = "negative"
            elif rating >= 4:
                sentiment = "positive"
            else:
                sentiment = "neutral"
        else:
            lower_text = raw_content.lower()
            neg_keywords = ["crash", "bug", "broken", "terrible", "slow", "error", "hate", "worst", "fail", "freeze", "issue", "problem"]
            pos_keywords = ["love", "great", "excellent", "awesome", "fast", "best", "perfect", "good"]
            if any(k in lower_text for k in neg_keywords):
                sentiment = "negative"
            elif any(k in lower_text for k in pos_keywords):
                sentiment = "positive"

        author_name = str(row[author_col]).strip() if author_col and pd.notna(row[author_col]) else "Anonymous"

        valid_items.append({
            "content": raw_content,
            "rating": rating,
            "sentiment": sentiment,
            "author_name": author_name,
            "source": "csv"
        })

    return valid_items, total_parsed, ignored_short
