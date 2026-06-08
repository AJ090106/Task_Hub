from PIL import Image
from rembg import remove
import io


def get_product_cutout(input_image: Image.Image) -> Image.Image:

    # Convert PIL image to bytes
    buffered = io.BytesIO()

    input_image.save(
        buffered,
        format="PNG"
    )

    input_bytes = buffered.getvalue()

    # Remove background
    output_bytes = remove(input_bytes)

    # Convert bytes back to PIL image
    output_image = Image.open(
        io.BytesIO(output_bytes)
    ).convert("RGBA")

    return output_image


def composite_images(
    foreground: Image.Image,
    background: Image.Image
) -> Image.Image:

    background = background.convert("RGBA")

    fg_w, fg_h = foreground.size
    bg_w, bg_h = background.size

    paste_x = (bg_w - fg_w) // 2
    paste_y = (bg_h - fg_h) // 2

    background.paste(
        foreground,
        (paste_x, paste_y),
        foreground
    )

    return background.convert("RGB")

def composite_images(product_img,background_img):
    bgw , bgh = background_img.size
    aspect_ratio = product_img.width / product_img.height
    new_width = int(bgw*0.5)
    new_height = int(new_width / aspect_ratio)
    product_resized = product_img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    offset = ((bgw-new_width)//2, (bgh-new_height)//2)

    background_img.paste(product_resized, offset, product_resized)
    return background_img