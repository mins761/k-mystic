import json
import os
import random
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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
PROVIDER = os.getenv("GENERATE_PROVIDER", "openrouter").strip().lower()
RATE_LIMIT_SECONDS = float(os.getenv("GENERATE_ALL_SLEEP_SECONDS", "8"))
MAX_RETRIES = int(os.getenv("GENERATE_ALL_MAX_RETRIES", "12"))
MAX_RATE_LIMIT_RETRIES = int(os.getenv("OPENROUTER_RATE_LIMIT_RETRIES", "36"))
DEFAULT_RATE_LIMIT_BACKOFF_SECONDS = float(os.getenv("OPENROUTER_RATE_LIMIT_BACKOFF_SECONDS", "90"))
DEFAULT_KEY_RATE_LIMIT_BACKOFF_SECONDS = float(
    os.getenv("OPENROUTER_KEY_RATE_LIMIT_BACKOFF_SECONDS", str(DEFAULT_RATE_LIMIT_BACKOFF_SECONDS))
)
OLLAMA_URL = os.getenv("OLLAMA_URL", "https://ollama.com/api/chat")
OLLAMA_TIMEOUT_SECONDS = int(os.getenv("OLLAMA_TIMEOUT_SECONDS", str(OPENROUTER_TIMEOUT_SECONDS)))

_model_index = 0
_key_index = 0
_model_cooldowns: dict[str, float] = {}
_key_cooldowns: dict[str, float] = {}
_route_lock = threading.Lock()


class ProviderAuthError(RuntimeError):
    pass


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
        raise RuntimeError("No usable generation models available")

    while True:
        with _route_lock:
            now = time.time()
            for _ in range(len(models)):
                model = models[_model_index % len(models)]
                _model_index += 1
                if _model_cooldowns.get(model, 0) <= now:
                    return model

            wait_seconds = max(1, min(cooldown - now for cooldown in _model_cooldowns.values() if cooldown > now))

        print(f"All generation models are cooling down; waiting {wait_seconds:.0f}s...", flush=True)
        time.sleep(wait_seconds)


def get_next_key(keys: list[str]) -> str:
    global _key_index
    if not keys:
        raise RuntimeError("No generation API keys available")

    while True:
        with _route_lock:
            now = time.time()
            for _ in range(len(keys)):
                key = keys[_key_index % len(keys)]
                _key_index += 1
                if _key_cooldowns.get(key, 0) <= now:
                    return key

            wait_seconds = max(1, min(cooldown - now for cooldown in _key_cooldowns.values() if cooldown > now))

        print(f"All generation API keys are cooling down; waiting {wait_seconds:.0f}s...", flush=True)
        time.sleep(wait_seconds)


def retry_after_seconds(response: requests.Response) -> float:
    retry_after = response.headers.get("retry-after")
    if retry_after:
        try:
            return max(1.0, float(retry_after))
        except ValueError:
            pass
    return DEFAULT_RATE_LIMIT_BACKOFF_SECONDS


def ollama_keys() -> list[str]:
    raw_keys = os.getenv("OLLAMA_API_KEYS") or os.getenv("OLLAMA_API_KEY") or ""
    keys = [key.strip() for key in raw_keys.split(",") if key.strip()]
    if not keys:
        raise RuntimeError("Missing OLLAMA_API_KEY or OLLAMA_API_KEYS")
    random.shuffle(keys)
    return keys


def ollama_models() -> list[str]:
    raw_models = os.getenv("OLLAMA_MODELS", "gemma4:31b-cloud,gpt-oss:20b")
    models = [model.strip() for model in raw_models.split(",") if model.strip()]
    if not models:
        raise RuntimeError("No Ollama models configured")
    return models


def validate_ollama_key(api_key: str) -> None:
    response = requests.get(
        "https://ollama.com/api/tags",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=OLLAMA_TIMEOUT_SECONDS,
    )
    if response.status_code == 401:
        raise RuntimeError(
            "Ollama returned 401 Unauthorized while validating OLLAMA_API_KEY. "
            "Create a new Ollama API key, save it as the GitHub Actions secret, "
            "then start a new workflow run."
        )
    response.raise_for_status()


def call_api_with_retry(prompt: str, keys: list[str], models: list[str], max_tokens: int) -> dict[str, Any] | None:
    if PROVIDER == "ollama":
        return call_ollama_with_retry(prompt, keys, models, max_tokens)

    return call_openrouter_with_retry(prompt, keys, models, max_tokens)


def call_ollama_with_retry(prompt: str, keys: list[str], models: list[str], max_tokens: int) -> dict[str, Any] | None:
    errors: list[str] = []
    attempt = 0
    rate_limit_attempt = 0

    while attempt < max(1, MAX_RETRIES) and rate_limit_attempt < max(1, MAX_RATE_LIMIT_RETRIES):
        model = get_next_model(models)
        api_key = get_next_key(keys)
        response: requests.Response | None = None

        try:
            attempt += 1
            print(f"Ollama attempt {attempt}/{MAX_RETRIES} using {model}", flush=True)
            response = requests.post(
                OLLAMA_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
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
                    "stream": False,
                    "format": "json",
                    "options": {
                        "temperature": 0.88,
                        "num_predict": max_tokens,
                    },
                },
                timeout=OLLAMA_TIMEOUT_SECONDS,
            )

            if response.status_code == 401:
                raise ProviderAuthError(
                    "Ollama returned 401 Unauthorized. Check that OLLAMA_API_KEY is a valid Ollama API key "
                    "and that the GitHub Actions secret was saved before starting this workflow run."
                )

            if response.status_code == 429:
                attempt -= 1
                rate_limit_attempt += 1
                backoff = retry_after_seconds(response)
                key_backoff = max(backoff, DEFAULT_KEY_RATE_LIMIT_BACKOFF_SECONDS)
                with _route_lock:
                    _model_cooldowns[model] = time.time() + backoff
                    _key_cooldowns[api_key] = time.time() + key_backoff
                errors.append(
                    f"{model}: 429 rate limited; model cooldown {backoff:.0f}s, key cooldown {key_backoff:.0f}s"
                )
                print(
                    f"429 on {model}; cooling model for {backoff:.0f}s and key for {key_backoff:.0f}s "
                    f"({rate_limit_attempt}/{MAX_RATE_LIMIT_RETRIES})...",
                    flush=True,
                )
                time.sleep(min(5, backoff))
                continue

            response.raise_for_status()
            data = response.json()
            content = data.get("message", {}).get("content")
            if not isinstance(content, str) or not content.strip():
                raise ValueError(f"Empty content from {data.get('model', model)}")
            return extract_json(content)
        except ProviderAuthError:
            raise
        except Exception as exc:  # noqa: BLE001 - rotate model/key and keep the batch alive.
            detail = ""
            if response is not None:
                detail = f" :: {response.text[:220]}"
            message = f"{model}: {exc}{detail}"
            errors.append(message)
            print(f"Error on {model}: {exc}", flush=True)
            time.sleep(5)

    print("Ollama generation failed: " + " | ".join(errors), flush=True)
    return None


def call_openrouter_with_retry(prompt: str, keys: list[str], models: list[str], max_tokens: int) -> dict[str, Any] | None:
    errors: list[str] = []
    attempt = 0
    rate_limit_attempt = 0

    while attempt < max(1, MAX_RETRIES) and rate_limit_attempt < max(1, MAX_RATE_LIMIT_RETRIES):
        model = get_next_model(models)
        api_key = get_next_key(keys)
        response: requests.Response | None = None

        try:
            attempt += 1
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
                attempt -= 1
                rate_limit_attempt += 1
                backoff = retry_after_seconds(response)
                key_backoff = max(backoff, DEFAULT_KEY_RATE_LIMIT_BACKOFF_SECONDS)
                with _route_lock:
                    _model_cooldowns[model] = time.time() + backoff
                    _key_cooldowns[api_key] = time.time() + key_backoff
                errors.append(
                    f"{model}: 429 rate limited; model cooldown {backoff:.0f}s, key cooldown {key_backoff:.0f}s"
                )
                print(
                    f"429 on {model}; cooling model for {backoff:.0f}s and key for {key_backoff:.0f}s "
                    f"and switching model ({rate_limit_attempt}/{MAX_RATE_LIMIT_RETRIES})...",
                    flush=True,
                )
                time.sleep(min(5, backoff))
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


def worker_count(key_count: int) -> int:
    configured = os.getenv("GENERATE_ALL_WORKERS")
    if configured:
        return max(1, int(configured))
    return max(1, min(2, key_count))


def build_tasks(completed_set: set[str]) -> list[dict[str, Any]]:
    tasks: list[dict[str, Any]] = []
    for card in TAROT_CARDS:
        for lang in LANGUAGES:
            key = f"tarot_{card['number']}_{lang}"
            if key not in completed_set:
                tasks.append(
                    {
                        "key": key,
                        "type": "tarot",
                        "label": f"{card['name']} in {lang}",
                        "card": card,
                        "lang": lang,
                    }
                )

    for sign_a in ZODIAC_SIGNS:
        for sign_b in ZODIAC_SIGNS:
            for lang in LANGUAGES:
                key = f"compatibility_{sign_a}_{sign_b}_{lang}"
                if key not in completed_set:
                    tasks.append(
                        {
                            "key": key,
                            "type": "compatibility",
                            "label": f"{sign_a} + {sign_b} in {lang}",
                            "sign_a": sign_a,
                            "sign_b": sign_b,
                            "lang": lang,
                        }
                    )
    return tasks


def run_task(task: dict[str, Any], keys: list[str], models: list[str]) -> tuple[str, str, bool]:
    client = supabase_client()
    task_type = str(task["type"])

    if task_type == "tarot":
        card = task["card"]
        lang = str(task["lang"])
        existed = tarot_exists(client, int(card["number"]), lang)
        if not existed:
            generate_tarot_item(client, keys, models, card, lang)
            time.sleep(RATE_LIMIT_SECONDS)
        return str(task["key"]), task_type, existed

    sign_a = str(task["sign_a"])
    sign_b = str(task["sign_b"])
    lang = str(task["lang"])
    existed = compatibility_exists(client, sign_a, sign_b, lang)
    if not existed:
        generate_compatibility_item(client, keys, models, sign_a, sign_b, lang)
        time.sleep(RATE_LIMIT_SECONDS)
    return str(task["key"]), task_type, existed


def main() -> None:
    started_at = time.time()
    if PROVIDER == "ollama":
        keys = ollama_keys()
        models = ollama_models()
        validate_ollama_key(keys[0])
    else:
        keys = openrouter_keys()
        models = openrouter_models()
    random.shuffle(models)

    progress = load_progress()
    completed = progress["completed"]
    completed_set = set(completed)
    failed_items: list[dict[str, str]] = []
    success = 0
    failed = 0
    skipped = len(completed_set)

    tarot_total = len(TAROT_CARDS) * len(LANGUAGES)
    compatibility_total = len(ZODIAC_SIGNS) * len(ZODIAC_SIGNS) * len(LANGUAGES)
    total = tarot_total + compatibility_total
    done = len(completed_set)

    print(f"Generation provider: {PROVIDER}", flush=True)
    print(f"Generation models: {', '.join(models)}", flush=True)
    print(f"Generating tarot ({tarot_total}) and compatibility ({compatibility_total}) content", flush=True)
    workers = worker_count(len(keys))
    print(f"Parallel workers: {workers}", flush=True)
    print_progress(done, total)

    tasks = build_tasks(completed_set)
    if not tasks:
        print("No remaining items to generate", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_task = {}
        for task in tasks:
            print(f"Queueing {task['label']}...", flush=True)
            future = executor.submit(run_task, task, keys, models)
            future_to_task[future] = task

        for future in as_completed(future_to_task):
            task = future_to_task[future]
            key = str(task["key"])
            task_type = str(task["type"])
            try:
                completed_key, _task_type, existed = future.result()
                if existed:
                    skipped += 1
                else:
                    success += 1

                completed.append(completed_key)
                completed_set.add(completed_key)
                done += 1
                save_progress(completed)
                print(f"{completed_key} done", flush=True)
            except Exception as exc:  # noqa: BLE001 - save failure and continue.
                failed += 1
                failed_items.append({"key": key, "type": task_type, "error": str(exc)})
                save_failed_items(failed_items)
                print(f"{key} failed: {exc}", flush=True)

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
