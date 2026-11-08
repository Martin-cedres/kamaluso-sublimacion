import os
import json
import urllib.request
import io
import hashlib
from PIL import Image

def main():
    with open('data/products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    os.makedirs('public/products', exist_ok=True)
    print(f'Procesando {len(products)} productos...')

    total_orig = 0
    total_opt = 0
    url_to_local = {}

    for p in products:
        images = p.get('images', [])
        new_images = []
        for idx, url in enumerate(images):
            if not url.startswith('http'):
                new_images.append(url)
                continue

            if url in url_to_local:
                new_images.append(url_to_local[url])
                continue

            # Create clean local filename
            slug = p.get('slug', 'prod')
            h = hashlib.md5(url.encode('utf-8')).hexdigest()[:6]
            local_name = f"{slug}-{idx}-{h}.webp"
            local_path = os.path.join('public', 'products', local_name)
            local_url = f"/products/{local_name}"

            if os.path.exists(local_path):
                url_to_local[url] = local_url
                new_images.append(local_url)
                continue

            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                data = urllib.request.urlopen(req, timeout=12).read()
                orig_size = len(data)
                total_orig += orig_size

                im = Image.open(io.BytesIO(data))
                if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                    bg = Image.new('RGB', im.size, (255, 255, 255))
                    bg.paste(im, mask=im.convert('RGBA').split()[3])
                    im = bg
                elif im.mode != 'RGB':
                    im = im.convert('RGB')

                # Thumbnail to max 600x600 px (ideal for high-DPI 2x retina on 300px cards)
                im.thumbnail((600, 600), Image.Resampling.LANCZOS)
                im.save(local_path, format='WEBP', quality=80, method=6)

                opt_size = os.path.getsize(local_path)
                total_opt += opt_size
                print(f"[{p['name'][:20]}] {orig_size//1024} KB -> {opt_size//1024} KB ({im.size}) -> {local_name}")

                url_to_local[url] = local_url
                new_images.append(local_url)
            except Exception as e:
                print(f"Error procesando {url}: {e}")
                new_images.append(url)

        p['images'] = new_images

    # Save updated products.json
    with open('data/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("\n================ RESUMEN ================")
    print(f"Peso original total: {total_orig // 1024} KB")
    print(f"Peso optimizado total: {total_opt // 1024} KB")
    if total_orig > 0:
        savings = (1 - total_opt / total_orig) * 100
        print(f"Ahorro de transferencia: {savings:.1f}%")
    print("Productos actualizados con URLs locales de /products/.")

if __name__ == '__main__':
    main()
