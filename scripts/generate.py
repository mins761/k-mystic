import json
import os
import random
import re
import time
from datetime import date
from typing import Any

import requests
from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()

LANGUAGES = ["en", "es", "ja", "zh-TW"]

LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "ja": "Japanese",
    "zh-TW": "Traditional Chinese",
}

DEFAULT_MODELS = ["openrouter/free"]
DEPRECATED_MODELS = {
    "qwen/qwen-2.5-72b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
}

ZODIAC_SIGNS = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
]

TAROT_CARDS = [
    {"number": 0, "name": "The Fool"},
    {"number": 1, "name": "The Magician"},
    {"number": 2, "name": "The High Priestess"},
    {"number": 3, "name": "The Empress"},
    {"number": 4, "name": "The Emperor"},
    {"number": 5, "name": "The Hierophant"},
    {"number": 6, "name": "The Lovers"},
    {"number": 7, "name": "The Chariot"},
    {"number": 8, "name": "Strength"},
    {"number": 9, "name": "The Hermit"},
    {"number": 10, "name": "Wheel of Fortune"},
    {"number": 11, "name": "Justice"},
    {"number": 12, "name": "The Hanged Man"},
    {"number": 13, "name": "Death"},
    {"number": 14, "name": "Temperance"},
    {"number": 15, "name": "The Devil"},
    {"number": 16, "name": "The Tower"},
    {"number": 17, "name": "The Star"},
    {"number": 18, "name": "The Moon"},
    {"number": 19, "name": "The Sun"},
    {"number": 20, "name": "Judgement"},
    {"number": 21, "name": "The World"},
]

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
API_SLEEP_SECONDS = 15


def env_required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def openrouter_keys() -> list[str]:
    raw_keys = os.getenv("OPENROUTER_API_KEYS") or os.getenv("OPENROUTER_API_KEY") or ""
    keys = [key.strip() for key in raw_keys.split(",") if key.strip()]
    if not keys:
        raise RuntimeError("Missing OPENROUTER_API_KEY or OPENROUTER_API_KEYS")
    random.shuffle(keys)
    return keys


def openrouter_models() -> list[str]:
    raw_models = os.getenv("OPENROUTER_MODELS", "")
    custom_models = [
        model.strip()
        for model in raw_models.split(",")
        if model.strip() and model.strip() not in DEPRECATED_MODELS
    ]
    models = DEFAULT_MODELS + [model for model in custom_models if model not in DEFAULT_MODELS]
    return models


def supabase_client() -> Client:
    url = env_required("SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )
    if not key:
        raise RuntimeError(
            "Missing SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )
    return create_client(url, key)


def extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    start = cleaned.find("{")
    if start == -1:
        raise ValueError("No JSON object found in model response")

    depth = 0
    in_string = False
    escaped = False
    for index, char in enumerate(cleaned[start:], start=start):
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                parsed = json.loads(cleaned[start : index + 1])
                if isinstance(parsed, dict):
                    return parsed
                break

    raise ValueError("Could not parse JSON object from model response")


def normalize_fortune(raw: dict[str, Any], fallback_title: str) -> dict[str, Any]:
    lucky_number = raw.get("lucky_number", random.randint(1, 9))
    try:
        lucky_number = int(lucky_number)
    except (TypeError, ValueError):
        lucky_number = random.randint(1, 9)

    compatibility = str(raw.get("compatibility") or random.choice(ZODIAC_SIGNS)).lower()
    compatibility = re.sub(r"[^a-z-]", "", compatibility)
    if compatibility not in ZODIAC_SIGNS:
        compatibility = random.choice(ZODIAC_SIGNS)

    title = str(raw.get("title") or fallback_title).strip()
    body = str(raw.get("body") or "").strip()
    lucky_color = str(raw.get("lucky_color") or "purple").strip().lower()
    affirmation = str(raw.get("affirmation") or "").strip()
    mantra = str(raw.get("mantra") or "").strip()
    best_time = str(raw.get("best_time") or "").strip()

    if not body:
        raise ValueError("Model response did not include a fortune body")

    return {
        "title": title[:240],
        "body": body,
        "lucky_number": max(1, min(9, lucky_number)),
        "lucky_color": lucky_color[:80],
        "compatibility": compatibility,
        "affirmation": affirmation[:500] if affirmation else None,
        "mantra": mantra[:500] if mantra else None,
        "best_time": best_time[:120] if best_time else None,
    }


def call_openrouter(prompt: str, keys: list[str]) -> dict[str, Any]:
    errors: list[str] = []
    models = openrouter_models()
    attempts: list[tuple[str, str]] = [(model, key) for key in keys for model in models]
    random.shuffle(attempts)

    for model, api_key in attempts:
        try:
            response = requests.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "https://k-mystic.vercel.app"),
                    "X-Title": os.getenv("OPENROUTER_APP_NAME", "K-Mystic"),
                },
                json={
                    "model": model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You generate concise daily mystic content and return valid JSON only.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.9,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"},
                },
                timeout=90,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return extract_json(content)
        except Exception as exc:  # noqa: BLE001 - log and rotate to the next key/model.
            detail = ""
            if "response" in locals() and response is not None:
                detail = f" :: {response.text[:240]}"
            errors.append(f"{model}: {exc}{detail}")
        finally:
            time.sleep(API_SLEEP_SECONDS)

    raise RuntimeError("OpenRouter generation failed: " + " | ".join(errors))


def tarot_prompt(card_name: str, language_name: str) -> str:
    return f"""
You are a professional mystical tarot reader with 20 years of experience.
Generate a detailed, insightful tarot reading for "{card_name}" card in {language_name}.

The reading must feel personal, mystical, and deeply meaningful.
Do NOT be vague or generic. Be specific and evocative.
Write minimum 400 words.
Be deeply detailed and specific.
DO NOT write short generic content.

Include ALL of these sections:
- Overall Energy (4-5 sentences) - the card's core message today
- Love & Relationships (4-5 sentences) - specific romantic/relationship guidance
- Career & Finance (4-5 sentences) - practical work and money advice
- Spiritual Growth (3-4 sentences) - inner wisdom and personal development
- Warning & Advice (3-4 sentences) - what to avoid, what to embrace
- Today's Affirmation - one powerful positive statement

Lucky number, lucky color, compatible zodiac.

Writing style:
- Mystical but accessible
- Warm and encouraging
- Use metaphors and imagery
- Feel like a real tarot reader speaking directly to the reader

Return JSON only:
{{
  "title": "Today's {card_name} Reading: [evocative subtitle]",
  "body": "... (minimum 400 words, rich, detailed, and sectioned)",
  "lucky_number": 7,
  "lucky_color": "deep purple",
  "compatibility": "scorpio",
  "affirmation": "..."
}}
""".strip()


def horoscope_prompt(sign: str, language_name: str, today: str) -> str:
    return f"""
You are a master astrologer with deep knowledge of Korean mysticism and Western astrology.
Generate today's detailed horoscope for {sign} in {language_name}.

Date: {today}
Make it feel timely, relevant, and deeply personal.

Include ALL sections:
1. Today's Overall Energy (3-4 sentences)
2. 💕 Love & Relationships (3-4 sentences)
3. 💼 Career & Ambition (3-4 sentences)
4. 💰 Money & Abundance (3-4 sentences)
5. 🏥 Health & Vitality (2-3 sentences)
6. 🌟 Spiritual Insight (2-3 sentences)
7. Today's Mantra - one powerful sentence
8. Best time of day for important decisions
9. Lucky number, lucky color, compatible sign

Writing style:
- Authoritative yet compassionate
- Specific and actionable advice
- Rich with astrological imagery
- Korean mystical elements (한국 신비주의 느낌)
- Speak directly to the reader as "you"

Return JSON only:
{{
  "title": "{sign.capitalize()} Horoscope: [evocative subtitle]",
  "body": "... (350-450 words, detailed and rich)",
  "lucky_number": 3,
  "lucky_color": "emerald green",
  "compatibility": "virgo",
  "best_time": "afternoon",
  "mantra": "..."
}}
""".strip()


def fortune_exists(client: Client, fortune_type: str, lang: str, today: str, sign: str | None = None) -> bool:
    query = (
        client.table("fortunes")
        .select("id")
        .eq("type", fortune_type)
        .eq("lang", lang)
        .eq("fortune_date", today)
        .limit(1)
    )

    if sign is None:
        query = query.is_("sign", "null")
    else:
        query = query.eq("sign", sign)

    result = query.execute()
    return bool(result.data)


def insert_fortune(client: Client, row: dict[str, Any]) -> None:
    client.table("fortunes").insert(row).execute()


def generate_tarot(client: Client, keys: list[str], lang: str, today: str) -> None:
    if fortune_exists(client, "tarot", lang, today):
        print(f"Skipping existing tarot for {lang} on {today}")
        return

    card = random.choice(TAROT_CARDS)
    raw = call_openrouter(tarot_prompt(card["name"], LANGUAGE_NAMES[lang]), keys)
    fortune = normalize_fortune(raw, f"{card['name']} Tarot Reading")

    insert_fortune(
        client,
        {
            **fortune,
            "type": "tarot",
            "sign": None,
            "lang": lang,
            "card_name": card["name"],
            "card_number": card["number"],
            "fortune_date": today,
        },
    )
    print(f"Inserted tarot for {lang}: {card['name']}")


def generate_horoscope(client: Client, keys: list[str], lang: str, sign: str, today: str) -> None:
    if fortune_exists(client, "horoscope", lang, today, sign):
        print(f"Skipping existing horoscope for {lang}/{sign} on {today}")
        return

    raw = call_openrouter(horoscope_prompt(sign, LANGUAGE_NAMES[lang], today), keys)
    fortune = normalize_fortune(raw, f"{sign.title()} Daily Horoscope")

    insert_fortune(
        client,
        {
            **fortune,
            "type": "horoscope",
            "sign": sign,
            "lang": lang,
            "card_name": None,
            "card_number": None,
            "fortune_date": today,
        },
    )
    print(f"Inserted horoscope for {lang}/{sign}")


def main() -> None:
    today = date.today().isoformat()
    client = supabase_client()
    keys = openrouter_keys()

    print(f"Generating K-Mystic fortunes for {today}")
    print(f"OpenRouter models: {', '.join(openrouter_models())}")
    for lang in LANGUAGES:
        generate_tarot(client, keys, lang, today)
        for sign in ZODIAC_SIGNS:
            generate_horoscope(client, keys, lang, sign, today)


if __name__ == "__main__":
    main()
