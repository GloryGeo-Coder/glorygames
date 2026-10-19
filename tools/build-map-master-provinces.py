"""Extract South African provinces from a pinned, public-domain Natural Earth source."""
import hashlib
import json
from pathlib import Path
import sys
import urllib.request

COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19'
URL = f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{COMMIT}/geojson/ne_10m_admin_1_states_provinces.geojson'
SHA256 = '22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5'
raw = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urllib.request.urlopen(URL, timeout=90).read()
assert hashlib.sha256(raw).hexdigest() == SHA256, 'Pinned source hash mismatch'
provinces = []
for feature in json.loads(raw)['features']:
    p, g = feature['properties'], feature['geometry']
    if p.get('admin') != 'South Africa':
        continue
    polygons = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    polygons = [[[[round(x, 5), round(y, 5)] for x, y in ring] for ring in polygon] for polygon in polygons]
    provinces.append(dict(id=p['iso_3166_2'], name=p['name_en'], label=[p['longitude'], p['latitude']], polygons=polygons))
provinces.sort(key=lambda x: x['id'])
assert len(provinces) == 9 and len({p['id'] for p in provinces}) == 9
data = dict(source='Natural Earth 1:10m Admin 1 — South Africa', provinces=provinces)
game = Path(__file__).resolve().parents[1] / 'apps/web/public/games/map-master-africa'
out = game / 'province-data.js'
out.write_text('/* Made with Natural Earth. See assets/maps/provinces-manifest.json. */\n(function(root){const data=' + json.dumps(data, separators=(',', ':')) + ";if(typeof module==='object'&&module.exports)module.exports=data;else root.ProvinceAtlasData=data;})(typeof window!=='undefined'?window:globalThis);\n")
manifest = dict(source=URL, sourceCommit=COMMIT, sourceSha256=SHA256, sourceScale='1:10,000,000', license='public domain', terms='https://www.naturalearthdata.com/about/terms-of-use/', attribution='Made with Natural Earth.', conversion='Select admin=South Africa; retain every polygon, ring and vertex; round coordinates to five decimal degrees. No simplification.', projection='Equirectangular: longitude, negative latitude. Overview only, not an equal-distance or equal-area map.', features=9, sourceVertices=sum(len(r) for p in provinces for poly in p['polygons'] for r in poly), file='province-data.js', bytes=out.stat().st_size, sha256=hashlib.sha256(out.read_bytes()).hexdigest())
(game / 'assets/maps/provinces-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest))
