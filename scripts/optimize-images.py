"""Create WebP and responsive variants while retaining the source photographs."""
from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
manifest = {}


def convert(source, bounds, widths):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert('RGB')
        image.thumbnail(bounds, Image.Resampling.LANCZOS)
        target = source.with_suffix('.webp')
        image.save(target, 'WEBP', quality=84, method=6)
        candidates = []
        for width in widths:
            if width >= image.width:
                continue
            smaller = image.resize((width, max(1, round(image.height * width / image.width))), Image.Resampling.LANCZOS)
            small_path = source.with_name(source.stem + '-' + str(width) + '.webp')
            smaller.save(small_path, 'WEBP', quality=82, method=6)
            candidates.append((small_path, width))
        candidates.append((target, image.width))
        relative = lambda path: path.relative_to(ROOT).as_posix()
        info = {'src': relative(target), 'width': image.width, 'height': image.height,
                'srcset': ', '.join(relative(path) + ' ' + str(width) + 'w' for path, width in candidates),
                'originalBytes': source.stat().st_size, 'bytes': target.stat().st_size}
        manifest[relative(source)] = info
        return info


for name in ['editorial-model', 'editorial-model-profile']:
    convert(ASSETS / (name + '.png'), (1024, 1536), [480, 768])
for name in ['academy-classic', 'academy-texture', 'academy-care']:
    convert(ASSETS / (name + '.png'), (1440, 960), [480, 768])
for source in sorted((ASSETS / 'products').glob('*.jpg')):
    convert(source, (1200, 1600), [240, 480, 800])

data_path = ASSETS / 'catalog-data.js'
text = data_path.read_text(encoding='utf-8')
start = text.index('return [') + len('return ')
end = text.rindex('];') + 1
products = json.loads(text[start:end])


def apply_metadata(item):
    path = Path(item['image'])
    if path.suffix == '.webp':
        path = path.with_suffix('.jpg')
    info = manifest[path.as_posix()]
    item.update(image=info['src'], imageWidth=info['width'], imageHeight=info['height'], imageSrcset=info['srcset'])


for product in products:
    apply_metadata(product)
    for variant in product['variants']:
        apply_metadata(variant)
data_path.write_text(text[:start] + json.dumps(products, ensure_ascii=False, indent=2) + text[end:], encoding='utf-8')
(ASSETS / 'image-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
report = {'sourceBytes': sum(item['originalBytes'] for item in manifest.values()),
          'webpBytes': sum(item['bytes'] for item in manifest.values()),
          'files': manifest}
output = ROOT.parent / 'output' / 'image-optimization-report.json'
output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({key: report[key] for key in ['sourceBytes', 'webpBytes']}))
