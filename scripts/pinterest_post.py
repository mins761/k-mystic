import io
import os
from datetime import date

import requests
from PIL import Image, ImageDraw
from supabase import create_client


PINTEREST_TOKEN = os.environ.get("PINTEREST_ACCESS_TOKEN")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_todays_tarot():
    today = date.today().isoformat()
    result = (
        supabase.table("fortunes")
        .select("*")
        .eq("type", "tarot")
        .eq("lang", "en")
        .eq("fortune_date", today)
        .single()
        .execute()
    )
    return result.data


def get_card_image(card_number):
    urls = {
        0: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg",
        1: "https://upload.wikimedia.org/wikipedia/commons/1/10/RWS_Tarot_01_Magician.jpg",
        2: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg",
        3: "https://upload.wikimedia.org/wikipedia/commons/d/d3/RWS_Tarot_03_Empress.jpg",
        4: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg",
        5: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg",
        6: "https://upload.wikimedia.org/wikipedia/commons/3/3a/RWS_Tarot_06_Lovers.jpg",
        7: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg",
        8: "https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg",
        9: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg",
        10: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",
        11: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg",
        12: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg",
        13: "https://upload.wikimedia.org/wikipedia/commons/4/4e/RWS_Tarot_13_Death.jpg",
        14: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg",
        15: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg",
        16: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg",
        17: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg",
        18: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg",
        19: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg",
        20: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg",
        21: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg",
    }
    return urls.get(card_number)


def create_pin_image(tarot, card_image_url):
    response = requests.get(card_image_url)
    card_img = Image.open(io.BytesIO(response.content))

    canvas = Image.new("RGB", (1000, 1500), color="#0A0A1A")

    card_img = card_img.resize((600, 1000))
    canvas.paste(card_img, (200, 200))

    draw = ImageDraw.Draw(canvas)

    draw.text((500, 80), "Today's Tarot", fill="#F59E0B", anchor="mm")
    draw.text((500, 130), tarot["card_name"], fill="#FFFFFF", anchor="mm")

    summary = tarot["body"][:100] + "..."
    draw.text((500, 1280), summary, fill="#E2E8F0", anchor="mm")
    draw.text((500, 1400), "k-mystic.vercel.app", fill="#F59E0B", anchor="mm")

    img_byte_arr = io.BytesIO()
    canvas.save(img_byte_arr, format="JPEG", quality=95)
    img_byte_arr.seek(0)
    return img_byte_arr


def get_board_id():
    response = requests.get(
        "https://api.pinterest.com/v5/boards",
        headers={"Authorization": f"Bearer {PINTEREST_TOKEN}"},
    )
    boards = response.json()["items"]
    for board in boards:
        if "tarot" in board["name"].lower():
            return board["id"]
    return boards[0]["id"]


def post_to_pinterest(tarot, image_bytes, board_id):
    media_response = requests.post(
        "https://api.pinterest.com/v5/media",
        headers={"Authorization": f"Bearer {PINTEREST_TOKEN}"},
        files={"file": ("tarot.jpg", image_bytes, "image/jpeg")},
    )
    media_id = media_response.json()["media_id"]

    pin_data = {
        "board_id": board_id,
        "title": f"Today's Tarot: {tarot['card_name']}",
        "description": f"""🔮 {tarot['title']}

{tarot['body'][:300]}...

✨ Get your full reading at k-mystic.vercel.app

#Tarot #TarotReading #DailyTarot #TarotCards
#KoreanMystic #Horoscope #Spirituality
#TarotCommunity #Mysticism #Fortune""",
        "link": "https://k-mystic.vercel.app/en/tarot",
        "media_source": {
            "source_type": "media_id",
            "media_id": media_id,
        },
    }

    response = requests.post(
        "https://api.pinterest.com/v5/pins",
        headers={
            "Authorization": f"Bearer {PINTEREST_TOKEN}",
            "Content-Type": "application/json",
        },
        json=pin_data,
    )
    return response.json()


def main():
    print("Starting Pinterest auto-posting...")

    tarot = get_todays_tarot()
    if not tarot:
        print("No tarot data found for today")
        return

    card_image_url = get_card_image(tarot["card_number"])
    if not card_image_url:
        print("No card image found")
        return

    image_bytes = create_pin_image(tarot, card_image_url)
    board_id = get_board_id()
    result = post_to_pinterest(tarot, image_bytes, board_id)

    print(f"Posted to Pinterest: {result}")


if __name__ == "__main__":
    main()
