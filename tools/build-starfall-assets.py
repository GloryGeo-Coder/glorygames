"""Build the original Starfall v4.1 models. +Y up, flight nose +Z.
All detail is geometry/material data inside the GLBs; no remote texture dependencies.
"""
from pathlib import Path
import importlib.util
import math
import json
import struct
import hashlib

spec = importlib.util.spec_from_file_location("wga_geometry", Path(__file__).with_name("build-high-speed-racer-assets.py"))
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)
g.OUT = Path(__file__).resolve().parents[1] / "apps/web/public/games/space-dodger/assets/models/starfall"
mat = g.material
assets = []


class Model(g.Model):
    def smooth_tri(self, name, material, points, normals):
        self.groups[name, material].extend((list(p), list(n)) for p, n in zip(points, normals))


def save(model, name):
    entry = model.save(name)
    path = g.OUT / name
    raw = path.read_bytes()
    length = struct.unpack_from("<I", raw, 12)[0]
    doc = json.loads(raw[20:20 + length])
    doc["asset"]["generator"] = "WebGameArena Starfall visual asset builder v4.1"
    doc["extras"]["forward"] = "+Z"
    text = json.dumps(doc, separators=(",", ":")).encode()
    text += b" " * (-len(text) % 4)
    tail = raw[20 + length:]
    data = struct.pack("<III", 0x46546C67, 2, 20 + len(text) + len(tail))
    data += struct.pack("<II", len(text), 0x4E4F534A) + text + tail
    path.write_bytes(data)
    entry.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    assets.append(entry)


def bevel(m, name, material, pos, size, amount=.12):
    """Closed chamfered box; face normals retain crisp manufactured edges."""
    half = [v / 2 for v in size]
    cut = min(amount, min(half) * .45)
    for axis in range(3):
        u, v = (axis + 1) % 3, (axis + 2) % 3
        a, b = half[u], half[v]
        outline = [(-a + cut, -b), (a - cut, -b), (a, -b + cut), (a, b - cut),
                   (a - cut, b), (-a + cut, b), (-a, b - cut), (-a, -b + cut)]
        for side in [-1, 1]:
            points = []
            for x, y in outline:
                p = list(pos)
                p[axis] += side * half[axis]
                p[u] += x
                p[v] += y
                points.append(p)
            if side < 0:
                points.reverse()
            for i in range(1, 7):
                m.tri(name, material, points[0], points[i], points[i + 1])
    # Each bevel edge joins the adjacent face polygons.
    for axis in range(3):
        u, v = (axis + 1) % 3, (axis + 2) % 3
        for su in [-1, 1]:
            for sv in [-1, 1]:
                points = []
                for end, face in [(-1, u), (1, u), (1, v), (-1, v)]:
                    p = list(pos)
                    p[axis] += end * (half[axis] - cut)
                    p[u] += su * (half[u] if face == u else half[u] - cut)
                    p[v] += sv * (half[v] if face == v else half[v] - cut)
                    points.append(p)
                if su * sv > 0:
                    points.reverse()
                m.quad(name, material, *points)
    for sx in [-1, 1]:
        for sy in [-1, 1]:
            for sz in [-1, 1]:
                signs = [sx, sy, sz]
                p = []
                for axis in range(3):
                    p.append([pos[i] + signs[i] * (half[i] if i == axis else half[i] - cut) for i in range(3)])
                if sx * sy * sz < 0:
                    p.reverse()
                m.tri(name, material, *p)


def tube(m, name, material, x, y, sections, segments=16):
    """Smooth axial metal / reactor rings. Each section is (z, radius)."""
    for (z0, r0), (z1, r1) in zip(sections, sections[1:]):
        slope = (r0 - r1) / (z1 - z0)
        norm = math.sqrt(1 + slope * slope)
        for i in range(segments):
            angles = [i * math.tau / segments, (i + 1) * math.tau / segments]
            a, b = angles
            p = [(x + math.cos(t) * r, y + math.sin(t) * r, z) for z, r, t in
                 [(z0, r0, a), (z0, r0, b), (z1, r1, b), (z1, r1, a)]]
            n = [(math.cos(t) / norm, math.sin(t) / norm, slope / norm) for t in [a, b, b, a]]
            if z1 < z0:
                p.reverse()
                n.reverse()
            m.smooth_tri(name, material, p[:3], n[:3])
            m.smooth_tri(name, material, [p[0], p[2], p[3]], [n[0], n[2], n[3]])


def disk(m, name, material, x, y, z, radius, segments=16, rear=False):
    for i in range(segments):
        a, b = i * math.tau / segments, (i + 1) * math.tau / segments
        p = [(x, y, z), (x + math.cos(a) * radius, y + math.sin(a) * radius, z),
             (x + math.cos(b) * radius, y + math.sin(b) * radius, z)]
        if rear:
            p.reverse()
        m.tri(name, material, *p)


def wing(m, material, side, width, sweep):
    a = (side * .42, -.06, .7 + sweep)
    b = (side * width, -.15, -.3 + sweep)
    c = (side * (width - .12), -.16, -1.23)
    d = (side * .4, -.06, -1.25)
    top = [a, b, c, d]
    if side < 0:
        top.reverse()
    bottom = [(x, y - .13, z) for x, y, z in top]
    m.quad("Hull", material, *top)
    m.quad("Hull", 1, *reversed(bottom))
    for i in range(4):
        j = (i + 1) % 4
        m.quad("Hull", 1, top[i], bottom[i], bottom[j], top[j])


def fighter(filename, variant):
    hero = variant == 0
    colors = [(.63, .72, .83), (.15, .20, .28), (.30, .16, .19), (.23, .29, .28)]
    materials = [
        mat("Ceramic armour", colors[variant], .38, .31, coat=True),
        mat("Graphite frame", (.022, .031, .048), .42, .46),
        mat("Polarised canopy", (.025, .13, .22), .45, .13, coat=True),
        mat("Crimson markings", (.72, .025, .055), .3, .32, (.12, .003, .006)),
        mat("Ion reactor", (.12, .58, .85) if hero else (.85, .065, .025), .1, .28,
            (.15, .75, 1) if hero else (1, .04, .012)),
        mat("Titanium edges", (.35, .43, .52), .65, .25)
    ]
    m = Model("Pathfinder" if hero else ["", "Red scout", "Siege fighter", "Warden drone"][variant], materials)
    # Preserve flight envelope; silhouettes differ through sweep, fuselage and nacelles.
    width = [1.9, 1.45, 1.8, 1.7][variant]
    m.loft("Hull", 0, [(-1.72, .46, -.2, .21), (-1.1, .62, -.23, .3),
                      (-.35, .65, -.22, .34), (.5, .48, -.18, .27),
                      (1.45, .23, -.08, .14), (2.1, .028, -.015, .045)])
    m.loft("Hull", 1, [(-.65, .34, .23, .38), (0, .37, .26, .66), (.64, .25, .2, .48), (1.05, .13, .13, .24)])
    m.loft("Hull", 2, [(-.51, .29, .34, .4), (0, .315, .36, .605), (.6, .21, .29, .43), (.87, .13, .22, .26)])
    for side in [-1, 1]:
        wing(m, 0, side, width, [.2, -.3, -.1, .65][variant])
        # Flush livery and panel strips follow the wing, rather than glowing solid wings.
        m.box("Hull", 3, (side * (width * .66), -.095, -.56), (.13, .025, .95))
        m.box("Hull", 5, (side * (width - .13), -.12, -.63), (.055, .05, 1.05))
        bevel(m, "Hull", 0, (side * .59, .015, -1.29), (.46, .48, .98), .07)
        tube(m, "Hull", 5, side * .59, .015, [(-1.81, .18), (-1.64, .23), (-1.26, .21)])
        tube(m, "Hull", 1, side * .59, .015, [(-1.825, .15), (-1.55, .12)])
        disk(m, "Hull", 4, side * .59, .015, -1.84, .13, rear=True)
        tube(m, "Hull", 4, side * .59, .015, [(-1.835, .17), (-1.85, .155)])
        for i in range(4):
            m.box("Hull", 1, (side * .59, .26, -1.48 + i * .14), (.3, .025, .048))
        # Twin tapered tail fins, navigation light, shoulder intakes.
        outline=[(-1.58,.2),(-1.3,.7),(-1.08,.65),(-.82,.2)]
        left=[(side*.59-.035,y,z) for z,y in outline]
        right=[(side*.59+.035,y,z) for z,y in outline]
        m.quad("Hull",0,*left);m.quad("Hull",0,*reversed(right))
        for i in range(4):
            j=(i+1)%4
            m.quad("Hull",0,left[i],right[i],right[j],left[j])
        bevel(m, "Hull", 1, (side * .48, .21, -.65), (.28, .12, .35), .025)
        m.box("Hull", 4, (side * (width - .08), -.11, -.22), (.075, .045, .12))
        m.box("Hull", 3, (side * .21, .35, -.23), (.045, .025, .48))
        if variant == 2:
            bevel(m, "Hull", 0, (side * 1.13, -.02, -.35), (.45, .35, 1.25), .06)
            tube(m, "Hull", 5, side * 1.13, -.02, [(.28, .12), (.72, .08)], 12)
            disk(m, "Hull", 4, side * 1.13, -.02, .73, .07, 12)
        if variant == 3:
            tube(m, "Hull", 5, side * 1.25, .02, [(-.5, .35), (-.28, .35)], 16)
            disk(m, "Hull", 2, side * 1.25, .02, -.27, .27)
    disk(m, "Nose", 5, 0, .02, 2.105, .028, 8)
    save(m, filename)


def fortress():
    materials = [mat("Citadel armour", (.075, .09, .135), .4, .38),
                 mat("Reactor conduits", (.8, .018, .055), .12, .28, (1, .01, .045)),
                 mat("Titanium ribs", (.28, .34, .43), .6, .28),
                 mat("Deep recess", (.012, .018, .03), .2, .55)]
    m = Model("Sovereign citadel", materials)
    m.loft("Citadel", 0, [(-2.5, 1.8, -.85, .15), (-1.2, 4, -.8, .65),
                         (.25, 3.8, -.72, .82), (1.25, 3.35, -.6, .65), (2.2, 2.3, -.4, .3)])
    for side in [-1, 1]:
        for i in range(4):
            x, height = side * (.9 + i * .66), 2.8 - i * .55
            bevel(m, "Citadel", 0, (x, .8 + height * .42, -.65 + i * .3), (.55, height, .65), .1)
            for j in range(3):
                m.box("Citadel", 1, (x, .8 + height * .4 + j * .25, -.31 + i * .3), (.22, .07, .025))
        for z in [-1.6, -.7, .2, 1.1]:
            m.box("Citadel", 2, (side * 2.7, .42, z), (1.3, .08, .13))
        for x in [1.4, 2.7]:
            bevel(m, "Citadel", 0, (side * x, -.25, 1.7), (.36, .45, 1.3), .06)
            tube(m, "Citadel", 2, side * x, -.25, [(2.1, .19), (2.8, .15), (3.0, .2)], 12)
            disk(m, "Citadel", 3, side * x, -.25, 3.01, .14, 12)
        tube(m, "Citadel", 2, side * 1.2, -.18, [(-2.51, .4), (-2.16, .5)], 16)
        disk(m, "Citadel", 1, side * 1.2, -.18, -2.52, .29, rear=True)
    tube(m, "Citadel", 2, 0, .03, [(2.22, .9), (2.4, .85), (2.42, .64)], 32)
    tube(m, "Reactor", 1, 0, .03, [(2.43, .6), (2.44, .53)], 32)
    disk(m, "Reactor", 1, 0, .03, 2.405, .47, 32)
    for i in range(12):
        a = i * math.tau / 12
        m.box("Citadel", 3, (math.cos(a) * .76, .03 + math.sin(a) * .76, 2.43), (.095, .095, .12))
    save(m, "sovereign_citadel.glb")


def rock(filename, ice=False):
    materials = [mat("Glacial stone" if ice else "Basalt", (.24, .38, .47) if ice else (.12, .085, .09), .08, .7),
                 mat("Fresh fracture", (.4, .57, .65) if ice else (.24, .17, .16), .15, .57),
                 mat("Crystal vein" if ice else "Magma fissure", (.09, .5, .68) if ice else (.7, .07, .008), .05, .38,
                     (.05, .28, .46) if ice else (.75, .035, .002))]
    m = Model("Cryo shard" if ice else "Lava asteroid", materials)
    segments, rings = (16, 9) if ice else (24, 13)
    points = []
    for j in range(rings + 1):
        latitude = math.pi * j / rings
        ring = []
        for i in range(segments):
            longitude = math.tau * i / segments
            r = 1 + .11 * math.sin(i * 2.7 + j * 1.9) + .07 * math.sin(i * 4.1 - j)
            # Broad crater basin and fractured surface, rather than emissive polygon patches.
            crater = math.exp(-((latitude - 1.05) ** 2 + (longitude - 2.1) ** 2) * 8)
            r -= .22 * crater
            ring.append((math.sin(latitude) * math.cos(longitude) * r,
                         math.cos(latitude) * (1.08 if ice else .95),
                         math.sin(latitude) * math.sin(longitude) * r))
        points.append(ring)
    for j in range(rings):
        for i in range(segments):
            k = (i + 1) % segments
            material = 1 if (i * 3 + j * 7) % 11 < 3 else 0
            m.quad("Asteroid", material, points[j][i], points[j][k], points[j + 1][k], points[j + 1][i])
    for i in range(18):
        j, k = 2 + (i * 7) % (rings - 3), (i * 5) % segments
        a, b = points[j][k], points[j + 1][(k + i % 2) % segments]
        a = tuple(v * 1.009 for v in a)
        b = tuple(v * 1.009 for v in b)
        c = (b[0] + .025, b[1] + .01, b[2] + .025)
        m.tri("Asteroid", 2, a, b, c)
    save(m, filename)


def relay():
    m = Model("Remnant command relay", [
        mat("Relay alloy", (.28, .34, .42), .6, .28), mat("Solar cells", (.015, .045, .10), .35, .26),
        mat("Signal red", (.8, .02, .06), .1, .3, (.8, .01, .03))])
    bevel(m, "Relay", 0, (0, 0, 0), (.65, .65, .65), .1)
    for side in [-1, 1]:
        m.box("Relay", 0, (side * 1.15, 0, 0), (1.5, .08, .95))
        for col in range(5):
            for row in range(3):
                m.box("Relay", 1, (side * (.52 + col * .27), .052, (row - 1) * .28), (.23, .02, .23))
        m.box("Relay", 0, (0, side * .9, 0), (.065, 1.4, .065))
        m.box("Relay", 2, (0, side * 1.51, 0), (.095, .07, .095))
    tube(m, "Relay", 0, 0, 0, [(.32, .26), (.46, .31), (.5, .18)], 24)
    disk(m, "Relay", 2, 0, 0, .505, .14, 24)
    save(m, "command_relay.glb")


def ark():
    m = Model("Dawn Ark", [mat("Ark ceramic", (.55, .63, .72), .32, .35),
                           mat("Ion lights", (.02, .45, .7), .1, .3, (.025, .55, .85)),
                           mat("Graphite decks", (.025, .045, .075), .35, .48),
                           mat("Alloy seams", (.28, .37, .44), .55, .32)])
    m.loft("Ark", 0, [(-2.6, .55, -.5, .5), (-1.8, 1.1, -.55, .65), (.8, 1, -.55, .64), (2.6, .2, -.2, .2)])
    bevel(m, "Ark", 2, (0, .65, .4), (.82, .25, .8), .06)
    for side in [-1, 1]:
        for z in [-1.5, -.3, .9]:
            bevel(m, "Ark", 0, (side * 1.08, 0, z), (.35, 1.05, 1), .08)
            m.box("Ark", 2, (side * 1.08, .535, z), (.26, .02, .7))
            m.box("Ark", 1, (side * 1.27, .16, z), (.02, .1, .6))
            for y in [-.32, .36]:
                m.box("Ark", 3, (side * 1.27, y, z), (.03, .05, .82))
        tube(m, "Ark", 3, side * .72, .1, [(-2.62, .25), (-2.2, .32)], 20)
        disk(m, "Ark", 1, side * .72, .1, -2.63, .18, 20, rear=True)
        for i in range(8):
            m.box("Ark", 1, (side * .68, .65, -1.3 + i * .3), (.12, .02, .06))
    save(m, "dawn_ark.glb")


def ring():
    m = Model("Orbital navigation ring", [
        mat("Station metal", (.23, .30, .39), .55, .32), mat("Guide cyan", (.03, .5, .7), .1, .3, (.02, .55, .8)),
        mat("Dark trusses", (.025, .04, .07), .4, .44)])
    # Closed octagonal cross-section: both side walls and bevels, no paper-thin annulus.
    profile = [(9.15, -.55), (9.85, -.55), (10, -.35), (10, .35),
               (9.85, .55), (9.15, .55), (9, .35), (9, -.35)]
    count = 64
    for i in range(count):
        a, b = i * math.tau / count, (i + 1) * math.tau / count
        for j in range(8):
            r0, z0 = profile[j]
            r1, z1 = profile[(j + 1) % 8]
            m.quad("Ring", 0, (math.cos(a) * r0, math.sin(a) * r0, z0),
                   (math.cos(b) * r0, math.sin(b) * r0, z0),
                   (math.cos(b) * r1, math.sin(b) * r1, z1), (math.cos(a) * r1, math.sin(a) * r1, z1))
        m.quad("Ring", 1, (math.cos(a) * 9.12, math.sin(a) * 9.12, -.56),
               (math.cos(b) * 9.12, math.sin(b) * 9.12, -.56),
               (math.cos(b) * 9.23, math.sin(b) * 9.23, -.56), (math.cos(a) * 9.23, math.sin(a) * 9.23, -.56))
    for i in range(12):
        a = i * math.tau / 12
        bevel(m, "Ring", 2, (math.cos(a) * 9.55, math.sin(a) * 9.55, -.59), (.38, .38, .24), .04)
    save(m, "orbital_ring.glb")


def pod():
    m = Model("Survey crew escape pod", [mat("Pod ceramic", (.66, .73, .80), .25, .32),
                                         mat("Rescue beacon", (.04, .65, .26), .1, .3, (.03, .8, .3)),
                                         mat("Polarised window", (.018, .08, .14), .4, .16, coat=True),
                                         mat("Frame", (.10, .16, .20), .6, .35)])
    m.loft("Pod", 0, [(-.9, .25, -.25, .25), (-.5, .45, -.38, .4), (.45, .45, -.38, .4), (.85, .22, -.2, .2)])
    bevel(m, "Pod", 2, (0, .395, 0), (.5, .055, .6), .02)
    for side in [-1, 1]:
        bevel(m, "Pod", 3, (side * .43, -.02, 0), (.11, .5, .85), .035)
        m.box("Pod", 1, (side * .495, .1, 0), (.025, .09, .5))
        tube(m, "Pod", 3, side * .24, -.15, [(-.91, .09), (-.75, .12)], 12)
        disk(m, "Pod", 1, side * .24, -.15, -.92, .065, 12, rear=True)
    disk(m, "Pod", 1, 0, .02, .86, .075, 16)
    save(m, "escape_pod.glb")


if __name__ == "__main__":
    for name, index in [("pathfinder.glb", 0), ("red_scout.glb", 1), ("siege_fighter.glb", 2), ("warden_drone.glb", 3)]:
        fighter(name, index)
    fortress()
    rock("lava_asteroid.glb")
    rock("cryo_shard.glb", True)
    relay()
    ark()
    ring()
    pod()
    (g.OUT / "assets.json").write_text(json.dumps({
        "license": "Original WebGameArena assets; Glory Mulopo", "forward": "+Z", "revision": "4.1",
        "assets": assets
    }, indent=2) + "\n")
    print(json.dumps(assets, indent=2))
