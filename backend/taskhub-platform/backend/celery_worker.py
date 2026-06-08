import os
import io
import requests
import base64
from celery import Celery
from supabase import create_client, Client
from PIL import Image, ImageDraw  # Added ImageDraw to create test backgrounds
from dotenv import load_dotenv

from image_processor import get_product_cutout, composite_images

load_dotenv()

# --- TESTING TOGGLE ---
# Set this to False to test completely locally for FREE.
# Set this to True when you are ready to use the real Stability AI.
USE_STABILITY_API = False 
# ----------------------

celery = Celery('tasks', 
                broker='redis://localhost:6379/0', 
                backend='redis://localhost:6379/0')

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

VARIATIONS = {
    "marble": "Luxury white marble surface, soft morning sunlight, 8k, photorealistic",
    "silk": "Wrinkled cream silk fabric, soft studio lighting, elegant, minimalist",
    "nature": "Flat lay on a smooth zen stone, small green leaf, natural outdoor lighting",
    "velvet": "Deep emerald green velvet texture, moody dramatic lighting",
    "wood": "Polished dark walnut wood table, warm golden hour light, bokeh",
    "glass": "Reflective black glass surface, cool blue rim lighting",
    "sand": "Light beige sand texture, bright tropical sunlight, beach vibe",
    "vintage": "Antique vanity mirror surface, soft rose gold hues, vintage luxury"
}

@celery.task(name="generate_all_variations")
def generate_all_variations(task_id, product_image_url):
    try:
        supabase.table('tasks').update({"status": "processing"}).eq("id", task_id).execute()

        response = requests.get(product_image_url)
        if response.status_code != 200:
            raise Exception("Could not download original image")
        
        product_cutout = get_product_cutout(response.content)

        # Basic solid colors to use for local testing backgrounds
        mock_colors = ["#e0e0e0", "#fff9db", "#e2f0d9", "#d9e1f2", "#fce4d6", "#ededed", "#fff2cc", "#e1d5e7"]

        for index, (style_name, prompt) in enumerate(VARIATIONS.items()):
            print(f"Working on style: {style_name}")
            
            background_img = None

            if USE_STABILITY_API:
                # --- LIVE MODE: Call Stability AI API ---
                print("Calling real Stability AI API...")
                bg_resp = requests.post(
                    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": f"Bearer {os.getenv('STABILITY_API_KEY')}",
                    },
                    json={
                        "text_prompts": [{"text": prompt}],
                        "cfg_scale": 7,
                        "height": 1024,
                        "width": 1024,
                        "steps": 30,
                    },
                )

                if bg_resp.status_code == 200:
                    data = bg_resp.json()
                    bg_bytes = base64.b64decode(data["artifacts"][0]["base64"])
                    background_img = Image.open(io.BytesIO(bg_bytes))
                else:
                    raise Exception(f"Stability AI error {bg_resp.status_code}: {bg_resp.text}")
            else:
                # --- TEST MODE: Generate a fast, free dummy background image locally ---
                print("Test Mode active: Generating a local colored canvas background...")
                background_img = Image.new("RGBA", (1024, 1024), color=mock_colors[index % len(mock_colors)])
                # Draw text on it so you know which style it represents
                draw = ImageDraw.Draw(background_img)
                draw.text((20, 20), f"Mock Background: {style_name.upper()}", fill="#000000")

            # Proceed only if we have a valid background image canvas
            if background_img:
                final_img = composite_images(product_cutout, background_img)

                output_buffer = io.BytesIO()
                final_img.save(output_buffer, format="PNG")
                output_buffer.seek(0)

                file_path = f"results/{task_id}/{style_name}.png"
                supabase.storage.from_('task-assets').upload(file_path, output_buffer.read())

                public_url = supabase.storage.from_('task-assets').get_public_url(file_path)
                supabase.table('generated_images').insert({
                    "task_id": task_id,
                    "image_type": style_name,
                    "image_url": public_url,
                    "prompt_used": prompt
                }).execute()

        supabase.table('tasks').update({"status": "completed"}).eq("id", task_id).execute()
        return f"Successfully generated 8 variations for task {task_id}"

    except Exception as e:
        print(f"Error: {str(e)}")
        supabase.table('tasks').update({"status": "failed"}).eq("id", task_id).execute()
        return f"Task {task_id} failed: {str(e)}"