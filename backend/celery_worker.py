import os
import io
import requests

from celery import Celery
from supabase import create_client, Client
from PIL import Image, ImageDraw
from dotenv import load_dotenv
from google import genai

from image_processor import (
    get_product_cutout,
    composite_images
)

load_dotenv()

gemini_client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY")
)

celery = Celery(
    'tasks',
    broker='redis://127.0.0.1:6379/0',
    backend='redis://127.0.0.1:6379/0'
)
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

VARIATIONS = {
    "white_bg": "Minimal white studio product photography",
    "luxury_marble": "Luxury marble premium advertisement",
    "luxury_velvet": "Luxury velvet cinematic campaign",
    "artistic_neon": "Cyberpunk neon artistic lighting",
    "artistic_pastel": "Soft pastel beauty campaign",
    "model_front": "Front-facing fashion advertisement",
    "model_side": "Side-angle premium campaign",
    "model_closeup": "Close-up cinematic luxury shot"
}

def generate_ai_product_scene(
    source_image_url: str,
    style_prompt: str
):

    try:

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                f"""
                Create a premium commercial product photography direction.

                Style:
                {style_prompt}

                The output should feel:
                - luxurious
                - cinematic
                - realistic
                - visually premium
                - social-media ready
                - modern campaign quality

                Product Reference:
                {source_image_url}
                """
            ]
        )

        generated_text = (
            response.text
            if hasattr(response, "text")
            else None
        )

        return generated_text

    except Exception as e:

        print(f"[GEMINI ERROR]: {str(e)}")

        return None

@celery.task(name="celery_worker.generate_all_variations")
def generate_all_variations(
    task_id: str,
    source_image_url: str
):

    print(f"[WORKER STARTED]: {task_id}")

    try:

        (
            supabase
            .table('tasks')
            .update({
                "status": "processing"
            })
            .eq("id", task_id)
            .execute()
        )

        img_response = requests.get(
            source_image_url,
            timeout=30
        )

        img_response.raise_for_status()

        base_product_image = Image.open(
            io.BytesIO(img_response.content)
        )

        product_cutout = get_product_cutout(
            base_product_image
        )

        style_configs = {

            "white_bg": {
                "bg": "#F8FAFC",
                "text": "#111827",
                "scale": 0.72,
                "offset": (0, 20),
            },

            "luxury_marble": {
                "bg": "#111111",
                "text": "#F3F4F6",
                "scale": 0.82,
                "offset": (0, 40),
            },

            "luxury_velvet": {
                "bg": "#3B0A0A",
                "text": "#FDECEC",
                "scale": 0.80,
                "offset": (-20, 30),
            },

            "artistic_neon": {
                "bg": "#140021",
                "text": "#C084FC",
                "scale": 0.75,
                "offset": (40, 10),
            },

            "artistic_pastel": {
                "bg": "#FCE7F3",
                "text": "#831843",
                "scale": 0.68,
                "offset": (-30, 20),
            },

            "model_front": {
                "bg": "#1E293B",
                "text": "#E2E8F0",
                "scale": 0.88,
                "offset": (0, 60),
            },

            "model_side": {
                "bg": "#0F172A",
                "text": "#CBD5E1",
                "scale": 0.85,
                "offset": (80, 40),
            },

            "model_closeup": {
                "bg": "#020617",
                "text": "#F8FAFC",
                "scale": 1.15,
                "offset": (0, -20),
            }
        }
        master_ai_direction = generate_ai_product_scene(source_image_url,
                                                        "Luxury premium commercial product campaign")

        print(f"[MASTER AI DIRECTION]: "f"{str(master_ai_direction)[:120]}")

        for idx, (style_name, prompt) in enumerate(
            VARIATIONS.items(),
            1
        ):

            print(
                f"Generating {style_name} ({idx}/8)"
            )

            ai_direction = master_ai_direction

            config = style_configs.get(
                style_name,
                style_configs["white_bg"]
            )

            background_img = Image.new(
                "RGB",
                (1024, 1024),
                color=config["bg"]
            )

            draw = ImageDraw.Draw(
                background_img
            )

            # Style Label
            draw.text(
                (40, 40),
                style_name.upper(),
                fill=config["text"]
            )

            # Gemini Text Overlay
            if ai_direction:

                draw.text(
                    (40, 120),
                    str(ai_direction)[:140],
                    fill=config["text"]
                )

            foreground_copy = (
                product_cutout.copy()
            )

            base_size = int(
                1024 * config["scale"]
            )

            foreground_copy.thumbnail(
                (base_size, base_size),
                Image.Resampling.LANCZOS
            )

            final_img = composite_images(
                foreground_copy,
                background_img
            )

            offset_x, offset_y = (
                config["offset"]
            )

            canvas = Image.new(
                "RGB",
                (1024, 1024),
                config["bg"]
            )

            paste_x = (
                (1024 - final_img.width) // 2
            ) + offset_x

            paste_y = (
                (1024 - final_img.height) // 2
            ) + offset_y

            canvas.paste(
                final_img,
                (paste_x, paste_y)
            )

            final_img = canvas

            output_buffer = io.BytesIO()

            final_img.save(
                output_buffer,
                format="PNG"
            )

            output_buffer.seek(0)

            file_path = (
                f"results/{task_id}/{style_name}.png"
            )

            (
                supabase
                .storage
                .from_('task-assets')
                .upload(
                    file_path,
                    output_buffer.read(),
                    file_options={
                        "upsert": "true"
                    }
                )
            )
            public_url = (
                supabase
                .storage
                .from_('task-assets')
                .get_public_url(file_path)
            )

            (
                supabase
                .table('generated_images')
                .insert({
                    "task_id": task_id,
                    "image_type": style_name,
                    "image_url": public_url,
                    "prompt_used": prompt
                })
                .execute()
            )

        (
            supabase
            .table('tasks')
            .update({
                "status": "under_review"
            })
            .eq("id", task_id)
            .execute()
        )

        print(
            f"[WORKER SUCCESS]: {task_id}"
        )

        return (
            f"Success for task {task_id}"
        )

    except Exception as e:

        print(
            f"[WORKER FAILED]: {str(e)}"
        )

        (
            supabase
            .table('tasks')
            .update({
                "status": "failed"
            })
            .eq("id", task_id)
            .execute()
        )

        return f"Failed: {str(e)}"