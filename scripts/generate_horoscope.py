from datetime import date

from generate import (
    LANGUAGE_NAMES,
    LANGUAGES,
    ZODIAC_SIGNS,
    call_openrouter,
    horoscope_prompt,
    insert_fortune,
    normalize_fortune,
    openrouter_keys,
    supabase_client,
)


TOTAL = len(ZODIAC_SIGNS) * len(LANGUAGES)


def horoscope_exists(client, lang: str, sign: str, today: str) -> bool:
    result = (
        client.table("fortunes")
        .select("id")
        .eq("type", "horoscope")
        .eq("lang", lang)
        .eq("sign", sign)
        .eq("fortune_date", today)
        .limit(1)
        .execute()
    )
    return bool(result.data)


def main() -> None:
    today = date.today().isoformat()
    client = supabase_client()
    keys = openrouter_keys()
    generated = 0
    failures: list[str] = []

    print(f"Generating {TOTAL} horoscope readings for {today}")
    for lang in LANGUAGES:
        for sign in ZODIAC_SIGNS:
            if horoscope_exists(client, lang, sign, today):
                print(f"Skipping existing horoscope {lang}/{sign}", flush=True)
                continue

            try:
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
                generated += 1
                print(f"Generated horoscope {lang}/{sign}", flush=True)
            except Exception as exc:  # noqa: BLE001 - retry the missing item on the next run.
                message = f"{lang}/{sign}: {exc}"
                failures.append(message)
                print(f"FAILED horoscope {message}", flush=True)

    print(f"Generated {generated}/{TOTAL} horoscope readings")
    if failures:
        print("Failed horoscope items:")
        for failure in failures:
            print(f"- {failure}")


if __name__ == "__main__":
    main()
