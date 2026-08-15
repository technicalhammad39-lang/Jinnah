import cairosvg
from PIL import Image
import os

svg_path = 'public/favicon.svg'
png_path = 'public/favicon_temp.png'
ico_path = 'app/favicon.ico'

# Convert SVG to PNG
cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=512, output_height=512)

# Convert PNG to ICO
img = Image.open(png_path)
img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(f"Successfully generated {ico_path}")

# Optional: Generate one in public/ as well for hardcoded links
img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

# Clean up
os.remove(png_path)
