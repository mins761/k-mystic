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

FREE_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
]

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

    if not body:
        raise ValueError("Model response did not include a fortune body")

    return {
        "title": title[:240],
        "body": body,
        "lucky_number": max(1, min(9, lucky_number)),
        "lucky_color": lucky_color[:80],
        "compatibility": compatibility,
    }


def call_openrouter(prompt: str, keys: list[str]) -> dict[str, Any]:
    errors: list[str] = []
    attempts = max(3, len(keys))

    for attempt in range(attempts):
        model = random.choice(FREE_MODELS)
        api_key = keys[attempt % len(keys)]
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
                    "max_tokens": 900,
                    "response_format": {"type": "json_object"},
                },
                timeout=90,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return extract_json(content)
        except Exception as exc:  # noqa: BLE001 - log and rotate to the next key/model.
            errors.append(f"{model}: {exc}")
        finally:
            time.sleep(API_SLEEP_SECONDS)

    raise RuntimeError("OpenRouter generation failed: " + " | ".join(errors))


def tarot_prompt(card_name: str, language_name: str) -> str:
    return f"""
Generate a mystical tarot reading for "{card_name}" card in {language_name}.

Write in a mystical, enchanting style.
Include:
- Overall message (2-3 sentences)
- Love & relationships insight
- Career & finance insight
- Lucky number (1-9)
- Lucky color
- Compatible zodiac sign

Return JSON only:
{{
  "title": "...",
  "body": "... (150-200 words)",
  "lucky_number": 7,
  "lucky_color": "purple",
  "compatibility": "leo"
}}
""".strip()


def horoscope_prompt(sign: str, language_name: str) -> str:
    return f"""
Generate today's horoscope for {sign} in {language_name}.

Write in mystical, encouraging style.
Include love, career, money, health insights.
Lucky number and color.

Return JSON only:
{{
  "title": "...",
  "body": "... (150-200 words)",
  "lucky_number": 3,
  "lucky_color": "gold",
  "compatibility": "scorpio"
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

    raw = call_openrouter(horoscope_prompt(sign, LANGUAGE_NAMES[lang]), keys)
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
    for lang in LANGUAGES:
        generate_tarot(client, keys, lang, today)
        for sign in ZODIAC_SIGNS:
            generate_horoscope(client, keys, lang, sign, today)


if __name__ == "__main__":
    main()
