import time

from generate import (
    LANGUAGE_NAMES,
    LANGUAGES,
    TAROT_CARDS,
    call_openrouter,
    insert_fortune,
    normalize_fortune,
    openrouter_keys,
    supabase_client,
)


TOTAL = len(TAROT_CARDS) * len(LANGUAGES)
RATE_LIMIT_SECONDS = 15


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


def tarot_exists(client, card_number: int, lang: str) -> bool:
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


def main() -> None:
    client = supabase_client()
    keys = openrouter_keys()
    generated = 0

    print(f"Generating {TOTAL} prebuilt tarot readings")
    for lang in LANGUAGES:
        for card in TAROT_CARDS:
            card_number = int(card["number"])
            card_name = str(card["name"])

            if tarot_exists(client, card_number, lang):
                print(f"Skipping existing tarot {lang}/{card_number}: {card_name}", flush=True)
                continue

            raw = call_openrouter(tarot_prompt(card_name, LANGUAGE_NAMES[lang]), keys, max_tokens=2400)
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
            generated += 1
            print(f"Generated tarot {lang}/{card_number}: {card_name}", flush=True)
            time.sleep(RATE_LIMIT_SECONDS)

    print(f"Generated {generated}/{TOTAL} tarot readings")


if __name__ == "__main__":
    main()
