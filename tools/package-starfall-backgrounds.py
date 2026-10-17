"""Encode generated Starfall artwork for runtime without resizing or changing its composition.
Usage: python3 tools/package-starfall-backgrounds.py /absolute/source-map.json
Requires Pillow only at authoring time. Checked-in JPEGs need no generation service at runtime.
"""
from pathlib import Path
import hashlib
import json
import sys
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'apps/web/public/games/space-dodger'


def digest(data):
    return hashlib.sha256(data).hexdigest()


if __name__ == '__main__':
    source_map = json.loads(Path(sys.argv[1]).read_text())
    assert len(source_map['assets']) == 18
    manifest = {'revision':'4.2', 'generation_mode':'Built-in image generation',
                'shared_prompt':source_map['shared_prompt'], 'assets':[]}
    for index, item in enumerate(source_map['assets']):
        source = Path(item['source'])
        assert source.is_file()
        destination = GAME / item['file']
        assert destination.resolve().is_relative_to((GAME / 'assets/backgrounds/sectors').resolve())
        destination.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as original:
            image = original.convert('RGB')
            # JPEG encoding only: preserve every source pixel's location and the native dimensions.
            image.save(destination, 'JPEG', quality=88, subsampling=0, optimize=True, progressive=True)
        with Image.open(destination) as encoded:
            rgb = encoded.convert('RGB')
            pixels=rgb.load()
            white = sum(1 for y in range(rgb.height) for x in range(rgb.width) if min(pixels[x,y]) > 248) / (rgb.width * rgb.height)
            mean = sum(ImageStat.Stat(rgb).mean) / 3
            assert 10 < mean < 170 and white < .03, (item['name'],mean,white)
            assert destination.stat().st_size < 900000
            entry = {'sector':index+1, 'name':item['name'], 'file':item['file'],
                     'width':rgb.width, 'height':rgb.height, 'bytes':destination.stat().st_size,
                     'sha256':digest(destination.read_bytes()), 'source_png_sha256':digest(source.read_bytes()),
                     'mean_rgb':round(mean,3), 'near_white_fraction':round(white,6),
                     'scene_prompt':item['scene_prompt']}
            manifest['assets'].append(entry)
            print(item['name'],rgb.size,entry['bytes'])
    (GAME / 'assets/backgrounds/sectors/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
