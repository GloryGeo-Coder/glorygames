#!/usr/bin/env python3
"""Create the bundled world overview from pinned public-domain Natural Earth data."""
import argparse, hashlib, json, urllib.request
from pathlib import Path

COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
URL = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{COMMIT}/geojson/ne_50m_admin_0_countries.geojson'
SOURCE_HASH = '3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb'
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, help='Optional previously downloaded pinned GeoJSON')
args = parser.parse_args()
raw = args.source.read_bytes() if args.source else urllib.request.urlopen(URL, timeout=45).read()
assert hashlib.sha256(raw).hexdigest() == SOURCE_HASH, 'Source changed; review before rebuilding'
countries = []
for feature in json.loads(raw)['features']:
    p, g = feature['properties'], feature['geometry']
    polygons = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    # Retain every source polygon/ring/vertex, including holes and small islands.
    polygons = [[[[round(x, 4), round(y, 4)] for x, y in ring] for ring in polygon] for polygon in polygons]
    countries.append(dict(id=p['ADM0_A3'], name=p['NAME_EN'], region=p['CONTINENT'],
                          label=[p['LABEL_X'], p['LABEL_Y']], polygons=polygons))
countries.sort(key=lambda c: c['id'])
assert len(countries) == 242 and len({c['id'] for c in countries}) == 242
data = dict(source='Natural Earth 1:50m Admin 0 countries and territories', countries=countries)
text = '/* Made with Natural Earth. Public-domain overview boundaries; see assets/maps/manifest.json. */\n'
text += '(function(root){const data=' + json.dumps(data, separators=(',', ':'), ensure_ascii=True)
text += ";if(typeof module==='object'&&module.exports)module.exports=data;else root.MapAtlasData=data;})(typeof window!=='undefined'?window:globalThis);\n"
repo = Path(__file__).resolve().parents[1]
game = repo / 'apps/web/public/games/map-master-africa'
output = game / 'atlas-data.js'
output.write_text(text)
preserved = [{'path':str(p.relative_to(repo)), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(game.rglob('*.png'))]
manifest = dict(source=URL, sourceCommit=COMMIT, sourceSha256=SOURCE_HASH,
                sourceScale='1:50,000,000', license='public domain',
                terms='https://www.naturalearthdata.com/about/terms-of-use/',
                attribution='Made with Natural Earth.',
                boundaryPolicy='Source de facto overview boundaries; mapped units include territories and disputed areas. The count is not a sovereign-state count.',
                conversion='All polygons, rings and vertices retained. Coordinates rounded to four decimal degrees. No simplification or invented boundaries.',
                projection='Equirectangular: x = longitude, y = -latitude. Not an equal-distance or equal-area map.',
                file='atlas-data.js', bytes=output.stat().st_size,
                sha256=hashlib.sha256(output.read_bytes()).hexdigest(), features=len(countries),
                sourceVertices=sum(len(r) for c in countries for p in c['polygons'] for r in p),
                preservedArtwork=preserved)
path = game / 'assets/maps/manifest.json'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps({k:v for k,v in manifest.items() if k not in ['preservedArtwork','conversion','boundaryPolicy']}))
