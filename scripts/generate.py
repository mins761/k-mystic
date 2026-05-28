import json
import os
import random
import re
import time
from datetime import date
from typing import Any

import requests
from dotenv import load_dotenv
from postgrest.exceptions import APIError
from supabase import Client, create_client


load_dotenv()

LANGUAGES = ["en", "es", "ja", "zh-TW"]

LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "ja": "Japanese",
    "zh-TW": "Traditional Chinese",
}

DEFAULT_MODELS = [
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "google/gemma-4-31b-it:free",
]
DEPRECATED_MODELS = {
    "qwen/qwen-2.5-72b-instruct:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "baidu/cobuddy-20260430:free",
    "openrouter/free",
}
UNSUITABLE_MODEL_PARTS = ("baidu/", "ocr", "-vl", "omni")

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
    {"number": 22, "name": "Ace of Wands"},
    {"number": 23, "name": "Two of Wands"},
    {"number": 24, "name": "Three of Wands"},
    {"number": 25, "name": "Four of Wands"},
    {"number": 26, "name": "Five of Wands"},
    {"number": 27, "name": "Six of Wands"},
    {"number": 28, "name": "Seven of Wands"},
    {"number": 29, "name": "Eight of Wands"},
    {"number": 30, "name": "Nine of Wands"},
    {"number": 31, "name": "Ten of Wands"},
    {"number": 32, "name": "Page of Wands"},
    {"number": 33, "name": "Knight of Wands"},
    {"number": 34, "name": "Queen of Wands"},
    {"number": 35, "name": "King of Wands"},
    {"number": 36, "name": "Ace of Cups"},
    {"number": 37, "name": "Two of Cups"},
    {"number": 38, "name": "Three of Cups"},
    {"number": 39, "name": "Four of Cups"},
    {"number": 40, "name": "Five of Cups"},
    {"number": 41, "name": "Six of Cups"},
    {"number": 42, "name": "Seven of Cups"},
    {"number": 43, "name": "Eight of Cups"},
    {"number": 44, "name": "Nine of Cups"},
    {"number": 45, "name": "Ten of Cups"},
    {"number": 46, "name": "Page of Cups"},
    {"number": 47, "name": "Knight of Cups"},
    {"number": 48, "name": "Queen of Cups"},
    {"number": 49, "name": "King of Cups"},
    {"number": 50, "name": "Ace of Swords"},
    {"number": 51, "name": "Two of Swords"},
    {"number": 52, "name": "Three of Swords"},
    {"number": 53, "name": "Four of Swords"},
    {"number": 54, "name": "Five of Swords"},
    {"number": 55, "name": "Six of Swords"},
    {"number": 56, "name": "Seven of Swords"},
    {"number": 57, "name": "Eight of Swords"},
    {"number": 58, "name": "Nine of Swords"},
    {"number": 59, "name": "Ten of Swords"},
    {"number": 60, "name": "Page of Swords"},
    {"number": 61, "name": "Knight of Swords"},
    {"number": 62, "name": "Queen of Swords"},
    {"number": 63, "name": "King of Swords"},
    {"number": 64, "name": "Ace of Pentacles"},
    {"number": 65, "name": "Two of Pentacles"},
    {"number": 66, "name": "Three of Pentacles"},
    {"number": 67, "name": "Four of Pentacles"},
    {"number": 68, "name": "Five of Pentacles"},
    {"number": 69, "name": "Six of Pentacles"},
    {"number": 70, "name": "Seven of Pentacles"},
    {"number": 71, "name": "Eight of Pentacles"},
    {"number": 72, "name": "Nine of Pentacles"},
    {"number": 73, "name": "Ten of Pentacles"},
    {"number": 74, "name": "Page of Pentacles"},
    {"number": 75, "name": "Knight of Pentacles"},
    {"number": 76, "name": "Queen of Pentacles"},
    {"number": 77, "name": "King of Pentacles"},
]

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
API_SLEEP_SECONDS = float(os.getenv("OPENROUTER_SLEEP_SECONDS", "1"))
OPENROUTER_TIMEOUT_SECONDS = int(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "45"))
OPENROUTER_ATTEMPTS_PER_MODEL = int(os.getenv("OPENROUTER_ATTEMPTS_PER_MODEL", "2"))
OPENROUTER_MODEL_CACHE: list[str] | None = None


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
    global OPENROUTER_MODEL_CACHE

    if OPENROUTER_MODEL_CACHE is not None:
        return OPENROUTER_MODEL_CACHE

    raw_models = os.getenv("OPENROUTER_MODELS", "")
    custom_models = [
        model.strip()
        for model in raw_models.split(",")
        if model.strip() and is_usable_model(model.strip())
    ]
    live_models = fetch_live_free_models()
    models = custom_models + [model for model in DEFAULT_MODELS if model in live_models]
    models += [model for model in live_models if model not in models][:4]
    if not models:
        models = [model for model in DEFAULT_MODELS if is_usable_model(model)]
    OPENROUTER_MODEL_CACHE = models
    return OPENROUTER_MODEL_CACHE


def is_usable_model(model: str) -> bool:
    lowered = model.lower()
    return model not in DEPRECATED_MODELS and not any(part in lowered for part in UNSUITABLE_MODEL_PARTS)


def fetch_live_free_models() -> list[str]:
    try:
        response = requests.get("https://openrouter.ai/api/v1/models", timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as exc:  # noqa: BLE001 - static defaults are enough when model discovery is unavailable.
        print(f"Could not fetch OpenRouter model list, using defaults: {exc}", flush=True)
        return []

    models = [
        item.get("id", "")
        for item in data.get("data", [])
        if isinstance(item, dict) and str(item.get("id", "")).endswith(":free")
    ]
    return [model for model in models if is_usable_model(model)]


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


def extract_json(text: Any) -> dict[str, Any]:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Model response content was empty")

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


def call_openrouter(prompt: str, keys: list[str], max_tokens: int = 1600) -> dict[str, Any]:
    errors: list[str] = []
    models = openrouter_models()
    attempts: list[tuple[str, str]] = [
        (model, key)
        for key in keys
        for model in models
        for _ in range(max(1, OPENROUTER_ATTEMPTS_PER_MODEL))
    ]
    random.shuffle(attempts)

    for attempt_index, (model, api_key) in enumerate(attempts, start=1):
        response: requests.Response | None = None
        try:
            print(f"OpenRouter attempt {attempt_index}/{len(attempts)} using {model}", flush=True)
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You generate detailed daily mystic content and return valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.9,
                "max_tokens": max_tokens,
            }
            response = requests.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "https://k-mystic.vercel.app"),
                    "X-Title": os.getenv("OPENROUTER_APP_NAME", "K-Mystic"),
                },
                json=payload,
                timeout=OPENROUTER_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not isinstance(content, str) or not content.strip():
                selected_model = data.get("model", model)
                finish_reason = data.get("choices", [{}])[0].get("finish_reason", "unknown")
                raise ValueError(f"Empty content from {selected_model} (finish_reason={finish_reason})")
            return extract_json(content)
        except Exception as exc:  # noqa: BLE001 - log and rotate to the next key/model.
            detail = ""
            if response is not None:
                detail = f" :: {response.text[:240]}"
            errors.append(f"{model}: {exc}{detail}")
        finally:
            if API_SLEEP_SECONDS > 0:
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
    try:
        client.table("fortunes").insert(row).execute()
    except APIError as exc:
        message = str(exc)
        optional_columns = {"affirmation", "mantra", "best_time"}
        missing_optional = [column for column in optional_columns if f"'{column}' column" in message]
        if not missing_optional:
            raise

        print(
            "Supabase schema is missing optional fortune columns "
            f"{', '.join(sorted(missing_optional))}; inserting without them. "
            "Run supabase.sql to persist these fields."
        )
        fallback_row = {key: value for key, value in row.items() if key not in optional_columns}
        client.table("fortunes").insert(fallback_row).execute()


def generate_tarot(client: Client, keys: list[str], lang: str, today: str) -> None:
    if fortune_exists(client, "tarot", lang, today):
        print(f"Skipping existing tarot for {lang} on {today}")
        return

    card = random.choice(TAROT_CARDS)
    raw = call_openrouter(tarot_prompt(card["name"], LANGUAGE_NAMES[lang]), keys, max_tokens=2000)
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

    raw = call_openrouter(horoscope_prompt(sign, LANGUAGE_NAMES[lang], today), keys, max_tokens=1200)
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
    failures: list[str] = []
    for lang in LANGUAGES:
        try:
            generate_tarot(client, keys, lang, today)
        except Exception as exc:  # noqa: BLE001 - keep the daily job moving.
            message = f"tarot/{lang}: {exc}"
            failures.append(message)
            print(f"FAILED {message}", flush=True)

        for sign in ZODIAC_SIGNS:
            try:
                generate_horoscope(client, keys, lang, sign, today)
            except Exception as exc:  # noqa: BLE001 - one bad free-model response should not kill the run.
                message = f"horoscope/{lang}/{sign}: {exc}"
                failures.append(message)
                print(f"FAILED {message}", flush=True)

    if failures:
        print("Generation finished with skipped items:", flush=True)
        for failure in failures:
            print(f"- {failure}", flush=True)


if __name__ == "__main__":
    main()
