"""Read unchanged atlas pixels and record isolated frames. Dev dependencies: Pillow, numpy, scipy."""
from pathlib import Path
import hashlib
import json
import statistics
import numpy as np
from PIL import Image
from scipy import ndimage

root = Path(__file__).resolve().parents[1] / 'apps/web/public/games/kasi-quest'
manifest_path = root / 'assets/animation/manifest.json'
manifest = json.loads(manifest_path.read_text())
clips = {
    'player': {'idle': [0, 4, 6, True], 'run': [4, 8, 14, True], 'jump': [12, 2, 9, False],
               'fall': [14, 2, 8, False], 'shoot': [16, 4, 18, False], 'land': [20, 2, 13, False],
               'hurt': [22, 2, 10, False], 'defeat': [24, 4, 7, False]},
    'enemy': {'idle': [0, 4, 5, True], 'run': [4, 8, 9, True], 'shoot': [12, 4, 14, False],
              'hurt': [16, 2, 10, False], 'windup': [18, 2, 7, False], 'defeat': [20, 4, 7, False]},
    'boss': {'idle': [0, 4, 5, True], 'run': [4, 4, 7, True], 'shoot': [8, 4, 12, False],
             'jump': [12, 2, 8, False], 'fall': [14, 2, 8, False], 'hurt': [16, 2, 8, False],
             'windup': [18, 2, 7, False], 'defeat': [20, 4, 6, False]},
}
atlases = {}
for item in manifest['assets']:
    path = root / 'assets/animation' / item['file']
    image = Image.open(path)
    assert image.mode == 'RGBA', item['kind']
    alpha = np.asarray(image.getchannel('A'))
    labels, _ = ndimage.label(alpha > 180)
    counts = np.bincount(labels.ravel())
    counts[0] = 0
    ids = np.flatnonzero(counts > 3500)
    assert len(ids) == item['rows'] * item['columns'], (item['kind'], len(ids))
    objects = ndimage.find_objects(labels)
    frames = []
    for index in ids:
        ys, xs = objects[index - 1]
        frames.append([xs.start, ys.start, xs.stop - xs.start, ys.stop - ys.start, int(index)])
    frames.sort(key=lambda f: f[1] + f[3] / 2)
    ordered = []
    for row in range(item['rows']):
        ordered.extend(sorted(frames[row * 4:row * 4 + 4], key=lambda f: f[0] + f[2] / 2))
    reference_height = statistics.median(f[3] for f in ordered[:4])
    # Padding retains antialiasing. It does not alter the PNG or normalize collapsed poses.
    padded = []
    for x, y, w, h, index in ordered:
        left, top = max(0, x - 2), max(0, y - 2)
        right, bottom = min(image.width, x + w + 2), min(image.height, y + h + 2)
        frame = {'crop': [left, top, right - left, bottom - top], 'content': [x, y, w, h]}
        # A few boss hands overlap a neighbouring pose's rectangular bounds.
        # Exclude that neighbour at draw time; never change the source PNG pixels.
        region = labels[top:bottom, left:right]
        foreign = np.isin(region, ids[ids != index])
        if foreign.any():
            mask = ndimage.binary_dilation(foreign, iterations=2) & (region != index)
            rectangles, active = [], {}
            for row_index, row in enumerate(mask):
                edges = np.diff(np.pad(row.astype(np.int8), (1, 1)))
                starts, stops = np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)
                current = {}
                for start, stop in zip(starts, stops):
                    key = (int(start), int(stop - start))
                    rect = active.get(key)
                    if rect is None:
                        rect = [int(start), row_index, int(stop - start), 0]
                        rectangles.append(rect)
                    rect[3] += 1
                    current[key] = rect
                active = current
            frame['exclude'] = rectangles
        padded.append(frame)
    kind = item['kind']
    atlases[kind] = {'url': './assets/animation/' + item['file'], 'width': image.width, 'height': image.height,
                     'referenceHeight': reference_height, 'frames': padded,
                     'clips': {key: {'start': v[0], 'count': v[1], 'fps': v[2], 'loop': v[3]} for key, v in clips[kind].items()}}
    item.update({'width': image.width, 'height': image.height, 'frames': len(ordered),
                 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                 'decoded_bytes': image.width * image.height * 4})
data = {'version': '3.2', 'atlases': atlases}
output = '/* Generated frame metadata; tools/build-kasi-animation-data.py reads source alpha without editing images. */\n'
output += '(function(root){ "use strict"; const data = ' + json.dumps(data, separators=(',', ':')) + ';\n'
output += 'if (typeof module === "object" && module.exports) module.exports = data; else root.KasiAnimationData = data;\n})(typeof window !== "undefined" ? window : globalThis);\n'
(root / 'kasi-animation-data.js').write_text(output)
manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
print('Recorded', sum(len(a['frames']) for a in atlases.values()), 'isolated frames; source PNGs unchanged.')
