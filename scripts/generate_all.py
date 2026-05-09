import json
import os
import random
import time
from pathlib import Path
from typing import Any

import requests
from supabase import Client

from generate import (
    LANGUAGE_NAMES,
    LANGUAGES,
    OPENROUTER_TIMEOUT_SECONDS,
    OPENROUTER_URL,
    TAROT_CARDS,
    ZODIAC_SIGNS,
    extract_json,
    insert_fortune,
    normalize_fortune,
    openrouter_keys,
    openrouter_models,
    supabase_client,
)


PROGRESS_FILE = Path("progress.json")
FAILED_FILE = Path("failed_items.json")
RATE_LIMIT_SECONDS = float(os.getenv("GENERATE_ALL_SLEEP_SECONDS", "2"))
MAX_RETRIES = int(os.getenv("GENERATE_ALL_MAX_RETRIES", "4"))

_model_index = 0


def load_progress() -> dict[str, list[str]]:
    if PROGRESS_FILE.exists():
        with PROGRESS_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
            if isinstance(data, dict) and isinstance(data.get("completed"), list):
                return {"completed": [str(item) for item in data["completed"]]}
    return {"completed": []}


def save_progress(completed: list[str]) -> None:
    with PROGRESS_FILE.open("w", encoding="utf-8") as file:
        json.dump({"completed": completed}, file, ensure_ascii=False, indent=2)


def save_failed_items(failed_items: list[dict[str, str]]) -> None:
    with FAILED_FILE.open("w", encoding="utf-8") as file:
        json.dump({"failed": failed_items}, file, ensure_ascii=False, indent=2)


def get_next_model(models: list[str]) -> str:
    global _model_index
    if not models:
        raise RuntimeError("No usable OpenRouter models available")
    model = models[_model_index % len(models)]
    _model_index += 1
    return model


def call_api_with_retry(prompt: str, keys: list[str], models: list[str], max_tokens: int) -> dict[str, Any] | None:
    errors: list[str] = []

    for attempt in range(1, max(1, MAX_RETRIES) + 1):
        model = get_next_model(models)
        api_key = random.choice(keys)
        response: requests.Response | None = None

        try:
            print(f"OpenRouter attempt {attempt}/{MAX_RETRIES} using {model}", flush=True)
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
                            "content": "Return valid JSON only. Do not include markdown fences or commentary.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.88,
                    "max_tokens": max_tokens,
                },
                timeout=OPENROUTER_TIMEOUT_SECONDS,
            )

            if response.status_code == 429:
                print(f"429 on {model}, switching model...", flush=True)
                time.sleep(10)
                continue

            response.raise_for_status()
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not isinstance(content, str) or not content.strip():
                selected_model = data.get("model", model)
                finish_reason = data.get("choices", [{}])[0].get("finish_reason", "unknown")
                raise ValueError(f"Empty content from {selected_model} (finish_reason={finish_reason})")
            return extract_json(content)
        except Exception as exc:  # noqa: BLE001 - rotate model/key and keep the batch alive.
            detail = ""
            if response is not None:
                detail = f" :: {response.text[:220]}"
            message = f"{model}: {exc}{detail}"
            errors.append(message)
            print(f"Error on {model}: {exc}", flush=True)
            time.sleep(5)

    print("OpenRouter generation failed: " + " | ".join(errors), flush=True)
    return None


def tarot_prompt(card_name: str, language_name: str) -> str:
    return f"""
You are a master tarot reader.
Write a complete, detailed tarot reading for
"{card_name}" card in {language_name}.

Minimum 500 words.
Include:
- Overall Energy (5 sentences)
- Love & Relationships (5 sentences)
- Career & Finance (5 sentences)
- Spiritual Growth (4 sentences)
- Warning & Advice (4 sentences)
- Today's Affirmation (1 powerful sentence)
- Lucky number, lucky color, compatible zodiac

Be specific, mystical, and deeply insightful.
NOT generic. Each reading unique to this card.

Return JSON:
{{
  "title": "...",
  "body": "... (500+ words)",
  "lucky_number": 7,
  "lucky_color": "...",
  "compatibility": "...",
  "affirmation": "..."
}}
""".strip()


def compatibility_prompt(sign_a: str, sign_b: str, language_name: str) -> str:
    return f"""
You are a compassionate astrologer specializing in romantic zodiac compatibility.
Write a detailed compatibility reading for {sign_a} and {sign_b} in {language_name}.

Include:
- Overall chemistry and emotional tone
- Communication style
- Romance and intimacy
- Long-term potential
- Main challenge
- Practical advice for harmony

Be specific to this exact sign pairing. Make the reading warm, honest, and useful.
Write 350-450 words.

Return JSON only:
{{
  "title": "{sign_a.title()} and {sign_b.title()} Compatibility: [evocative subtitle]",
  "score": 82,
  "body": "...",
  "advice": "...",
  "strength": "...",
  "challenge": "..."
}}
""".strip()


def tarot_exists(client: Client, card_number: int, lang: str) -> bool:
    result = (
        client.table("fortunes")
        .select("id")
        .eq("type", "tarot")
        .eq("card_number", card_number)
        .eq("lang", lang)
        .is_("fortune_date", "null")
        .limit(1)
        .execute()
    )
    return bool(result.data)


def compatibility_exists(client: Client, sign_a: str, sign_b: str, lang: str) -> bool:
    result = (
        client.table("compatibility_readings")
        .select("id")
        .eq("sign_a", sign_a)
        .eq("sign_b", sign_b)
        .eq("lang", lang)
        .limit(1)
        .execute()
    )
    return bool(result.data)


def normalize_compatibility(raw: dict[str, Any], sign_a: str, sign_b: str) -> dict[str, Any]:
    score = raw.get("score", random.randint(62, 96))
    try:
        score = int(score)
    except (TypeError, ValueError):
        score = random.randint(62, 96)

    body = str(raw.get("body") or "").strip()
    if not body:
        raise ValueError("Model response did not include compatibility body")

    return {
        "title": str(raw.get("title") or f"{sign_a.title()} and {sign_b.title()} Compatibility")[:240],
        "score": max(0, min(100, score)),
        "body": body,
        "advice": str(raw.get("advice") or "")[:1000] or None,
        "strength": str(raw.get("strength") or "")[:1000] or None,
        "challenge": str(raw.get("challenge") or "")[:1000] or None,
        "result": raw,
    }


def generate_tarot_item(
    client: Client,
    keys: list[str],
    models: list[str],
    card: dict[str, Any],
    lang: str,
) -> None:
    card_number = int(card["number"])
    card_name = str(card["name"])

    if tarot_exists(client, card_number, lang):
        return

    raw = call_api_with_retry(tarot_prompt(card_name, LANGUAGE_NAMES[lang]), keys, models, max_tokens=2600)
    if raw is None:
        raise RuntimeError("No tarot response returned after retries")

    fortune = normalize_fortune(raw, f"{card_name} Tarot Reading")
    insert_fortune(
        client,
        {
            **fortune,
            "type": "tarot",
            "sign": None,
            "lang": lang,
            "card_name": card_name,
            "card_number": card_number,
            "fortune_date": None,
        },
    )


def generate_compatibility_item(
    client: Client,
    keys: list[str],
    models: list[str],
    sign_a: str,
    sign_b: str,
    lang: str,
) -> None:
    if compatibility_exists(client, sign_a, sign_b, lang):
        return

    raw = call_api_with_retry(compatibility_prompt(sign_a, sign_b, LANGUAGE_NAMES[lang]), keys, models, max_tokens=1500)
    if raw is None:
        raise RuntimeError("No compatibility response returned after retries")

    reading = normalize_compatibility(raw, sign_a, sign_b)
    client.table("compatibility_readings").insert(
        {
            **reading,
            "sign_a": sign_a,
            "sign_b": sign_b,
            "lang": lang,
        }
    ).execute()


def print_progress(done: int, total: int) -> None:
    percent = (done / total) * 100 if total else 100
    print(f"Progress: {done}/{total} ({percent:.1f}%)", flush=True)


def main() -> None:
    started_at = time.time()
    client = supabase_client()
    keys = openrouter_keys()
    models = openrouter_models()
    random.shuffle(models)

    progress = load_progress()
    completed = progress["completed"]
    completed_set = set(completed)
    failed_items: list[dict[str, str]] = []
    success = 0
    failed = 0
    skipped = 0

    tarot_total = len(TAROT_CARDS) * len(LANGUAGES)
    compatibility_total = len(ZODIAC_SIGNS) * len(ZODIAC_SIGNS) * len(LANGUAGES)
    total = tarot_total + compatibility_total
    done = len(completed_set)

    print(f"OpenRouter models: {', '.join(models)}", flush=True)
    print(f"Generating tarot ({tarot_total}) and compatibility ({compatibility_total}) content", flush=True)
    print_progress(done, total)

    for card in TAROT_CARDS:
        for lang in LANGUAGES:
            key = f"tarot_{card['number']}_{lang}"
            label = f"{card['name']} in {lang}"

            if key in completed_set:
                skipped += 1
                print(f"Skipping {key} (already done)", flush=True)
                continue

            print(f"[{done + 1}/{total}] Generating {label}...", flush=True)
            try:
                existed = tarot_exists(client, int(card["number"]), lang)
                if existed:
                    skipped += 1
                else:
                    generate_tarot_item(client, keys, models, card, lang)
                    success += 1
                    time.sleep(RATE_LIMIT_SECONDS)

                completed.append(key)
                completed_set.add(key)
                done += 1
                save_progress(completed)
                print(f"{key} done", flush=True)
            except Exception as exc:  # noqa: BLE001 - save failure and continue.
                failed += 1
                failed_items.append({"key": key, "type": "tarot", "error": str(exc)})
                save_failed_items(failed_items)
                print(f"{key} failed: {exc}", flush=True)
                time.sleep(5)
                continue

            print_progress(done, total)

    for sign_a in ZODIAC_SIGNS:
        for sign_b in ZODIAC_SIGNS:
            for lang in LANGUAGES:
                key = f"compatibility_{sign_a}_{sign_b}_{lang}"
                label = f"{sign_a} + {sign_b} in {lang}"

                if key in completed_set:
                    skipped += 1
                    print(f"Skipping {key} (already done)", flush=True)
                    continue

                print(f"[{done + 1}/{total}] Generating {label}...", flush=True)
                try:
                    existed = compatibility_exists(client, sign_a, sign_b, lang)
                    if existed:
                        skipped += 1
                    else:
                        generate_compatibility_item(client, keys, models, sign_a, sign_b, lang)
                        success += 1
                        time.sleep(RATE_LIMIT_SECONDS)

                    completed.append(key)
                    completed_set.add(key)
                    done += 1
                    save_progress(completed)
                    print(f"{key} done", flush=True)
                except Exception as exc:  # noqa: BLE001 - save failure and continue.
                    failed += 1
                    failed_items.append({"key": key, "type": "compatibility", "error": str(exc)})
                    save_failed_items(failed_items)
                    print(f"{key} failed: {exc}", flush=True)
                    time.sleep(5)
                    continue

                print_progress(done, total)

    elapsed_minutes = (time.time() - started_at) / 60
    save_failed_items(failed_items)
    print(
        f"""
Completed: {success}
Failed: {failed}
Skipped: {skipped}
Elapsed minutes: {elapsed_minutes:.1f}
""".strip(),
        flush=True,
    )


if __name__ == "__main__":
    main()
