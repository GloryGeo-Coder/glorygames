"""Render original GLBs to compatibility atlases and inspect the actual sky shaders.
Offline authoring only: Python numpy/Pillow and Mesa EGL/GLES2; no browser dependency.
Run after build-starfall-assets.py. Never required by the web app or deployment build.
"""
import ctypes as C
import json
import math
import os
from pathlib import Path
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "apps/web/public/games/space-dodger"
os.environ.setdefault("EGL_PLATFORM", "surfaceless")
egl = C.CDLL("libEGL.so.1")
try:
    gl = C.CDLL("libGLESv2.so.2")
except OSError:
    gl = C.CDLL("libGL.so.1")  # GLVND dispatches the current EGL ES context too.


def bind(lib, name, result, *args):
    f = getattr(lib, name)
    f.restype, f.argtypes = result, list(args)
    return f


ptr, integer, uint, flt = C.c_void_p, C.c_int, C.c_uint, C.c_float
display = bind(egl, "eglGetDisplay", ptr, ptr)(None)
assert bind(egl, "eglInitialize", uint, ptr, ptr, ptr)(display, None, None)
bind(egl, "eglBindAPI", uint, uint)(0x30A0)
attrs = (integer * 15)(0x3033, 1, 0x3040, 4, 0x3024, 8, 0x3023, 8, 0x3022, 8, 0x3021, 8, 0x3025, 24, 0x3038)
config, count = ptr(), integer()
assert bind(egl, "eglChooseConfig", uint, ptr, ptr, ptr, integer, ptr)(display, attrs, C.byref(config), 1, C.byref(count))
context = bind(egl, "eglCreateContext", ptr, ptr, ptr, ptr, ptr)(display, config, None, (integer * 3)(0x3098, 2, 0x3038))
surface = bind(egl, "eglCreatePbufferSurface", ptr, ptr, ptr, ptr)(display, config, (integer * 5)(0x3057, 2048, 0x3056, 1024, 0x3038))
assert bind(egl, "eglMakeCurrent", uint, ptr, ptr, ptr, ptr)(display, surface, surface, context)

for name, result, args in [
    ("glCreateShader", uint, [uint]), ("glShaderSource", None, [uint, integer, ptr, ptr]),
    ("glCompileShader", None, [uint]), ("glGetShaderiv", None, [uint, uint, ptr]),
    ("glGetShaderInfoLog", None, [uint, integer, ptr, ptr]), ("glCreateProgram", uint, []),
    ("glAttachShader", None, [uint, uint]), ("glLinkProgram", None, [uint]),
    ("glGetProgramiv", None, [uint, uint, ptr]), ("glGetProgramInfoLog", None, [uint, integer, ptr, ptr]),
    ("glGetAttribLocation", integer, [uint, C.c_char_p]), ("glGetUniformLocation", integer, [uint, C.c_char_p]),
    ("glUseProgram", None, [uint]), ("glUniform1f", None, [integer, flt]),
    ("glUniform3f", None, [integer, flt, flt, flt]), ("glUniform2f", None, [integer, flt, flt]),
    ("glUniform1i", None, [integer, integer]), ("glGenTextures", None, [integer, ptr]),
    ("glBindTexture", None, [uint, uint]), ("glActiveTexture", None, [uint]),
    ("glTexParameteri", None, [uint, uint, integer]), ("glPixelStorei", None, [uint, integer]),
    ("glTexImage2D", None, [uint, integer, integer, integer, integer, integer, uint, uint, ptr]),
    ("glDeleteTextures", None, [integer, ptr]), ("glUniformMatrix4fv", None, [integer, integer, uint, ptr]),
    ("glGenBuffers", None, [integer, ptr]), ("glBindBuffer", None, [uint, uint]),
    ("glBufferData", None, [uint, C.c_size_t, ptr, uint]), ("glEnableVertexAttribArray", None, [uint]),
    ("glDisableVertexAttribArray", None, [uint]), ("glVertexAttribPointer", None, [uint, integer, uint, uint, integer, ptr]),
    ("glDrawArrays", None, [uint, integer, integer]), ("glDeleteBuffers", None, [integer, ptr]),
    ("glViewport", None, [integer, integer, integer, integer]), ("glClearColor", None, [flt, flt, flt, flt]),
    ("glClear", None, [uint]), ("glEnable", None, [uint]), ("glDisable", None, [uint]),
    ("glReadPixels", None, [integer, integer, integer, integer, uint, uint, ptr]),
    ("glGetString", C.c_char_p, [uint]), ("glGetError", uint, [])
]:
    bind(gl, name, result, *args)


def program(vertex, fragment):
    shaders = []
    for kind, source in [(0x8B31, vertex), (0x8B30, fragment)]:
        shader = gl.glCreateShader(kind)
        text = C.c_char_p(source.encode())
        gl.glShaderSource(shader, 1, C.byref(text), None)
        gl.glCompileShader(shader)
        ok = integer()
        gl.glGetShaderiv(shader, 0x8B81, C.byref(ok))
        log = C.create_string_buffer(16384)
        gl.glGetShaderInfoLog(shader, len(log), None, log)
        assert ok.value, log.value.decode()
        shaders.append(shader)
    p = gl.glCreateProgram()
    for shader in shaders:
        gl.glAttachShader(p, shader)
    gl.glLinkProgram(p)
    ok = integer()
    gl.glGetProgramiv(p, 0x8B82, C.byref(ok))
    log = C.create_string_buffer(16384)
    gl.glGetProgramInfoLog(p, len(log), None, log)
    assert ok.value, log.value.decode()
    return p


def vector(p, name, value):
    gl.glUniform3f(gl.glGetUniformLocation(p, name.encode()), *value)


def number(p, name, value):
    gl.glUniform1f(gl.glGetUniformLocation(p, name.encode()), value)


def matrix(p, name, value):
    data = np.ascontiguousarray(value.T, dtype=np.float32)
    gl.glUniformMatrix4fv(gl.glGetUniformLocation(p, name.encode()), 1, 0, data.ctypes.data)


def normalize(v):
    v = np.array(v, dtype=float)
    return v / np.linalg.norm(v)


def view(eye, target=(0, 0, 0), up=(0, 1, 0)):
    z = normalize(np.array(eye) - target)
    x = normalize(np.cross(up, z))
    y = np.cross(z, x)
    m = np.eye(4)
    m[:3, :3] = [x, y, z]
    m[:3, 3] = -m[:3, :3] @ eye
    return m


def perspective(aspect, fov=.92):
    f, near, far = 1 / math.tan(fov / 2), .05, 520
    return np.array([[f / aspect, 0, 0, 0], [0, f, 0, 0],
                     [0, 0, (far + near) / (near - far), 2 * far * near / (near - far)], [0, 0, -1, 0]])


def draw(p, positions, normals=None):
    buffers, locations = [], []
    for name, data in [("position", positions), ("normal", normals)]:
        if data is None:
            continue
        location = gl.glGetAttribLocation(p, name.encode())
        if location < 0:
            continue
        a = np.ascontiguousarray(data, dtype=np.float32)
        buffer = uint()
        gl.glGenBuffers(1, C.byref(buffer))
        gl.glBindBuffer(0x8892, buffer)
        gl.glBufferData(0x8892, a.nbytes, a.ctypes.data, 0x88E4)
        gl.glEnableVertexAttribArray(location)
        gl.glVertexAttribPointer(location, 3, 0x1406, 0, 0, None)
        buffers.append(buffer)
        locations.append(location)
    gl.glDrawArrays(4, 0, len(positions))
    for location in locations:
        gl.glDisableVertexAttribArray(location)
    for buffer in buffers:
        gl.glDeleteBuffers(1, C.byref(buffer))


model_program = program("""precision highp float;
attribute vec3 position;attribute vec3 normal;uniform mat4 worldViewProjection;
varying vec3 vN;varying vec3 vP;
void main(){vN=normal;vP=position;gl_Position=worldViewProjection*vec4(position,1.);}""", """precision highp float;
varying vec3 vN;varying vec3 vP;uniform vec3 baseColor;uniform vec3 emission;
uniform vec3 eye;uniform float roughness;uniform float metallic;
void main(){vec3 n=normalize(vN),l=normalize(vec3(-.4,.8,-.6));vec3 v=normalize(eye-vP);
float key=max(0.,dot(n,l));float rim=max(0.,dot(n,normalize(vec3(.6,.3,1.))));
vec3 lit=baseColor*(.15+max(n.y,0.)*.15+key*.95+rim*.22);
float spec=pow(max(0.,dot(n,normalize(l+v))),mix(100.,12.,roughness));
lit+=mix(vec3(.04),baseColor,metallic)*spec*.8+vec3(.07,.13,.24)*rim*.3+emission;
gl_FragColor=vec4(pow(max(lit,vec3(0.)),vec3(1./2.2)),1.);}""")


def model_image(filename, size=512, eye=(0, 9, 4), up=(0, 0, -1), bank=0, reactor=1):
    raw = (GAME / "assets/models/starfall" / filename).read_bytes()
    length = int.from_bytes(raw[12:16], "little")
    doc = json.loads(raw[20:20 + length])
    binary = raw[28 + length:]
    def values(index):
        accessor = doc["accessors"][index]
        buffer = doc["bufferViews"][accessor["bufferView"]]
        return np.frombuffer(binary, dtype="<f4", count=accessor["count"] * 3,
                             offset=buffer.get("byteOffset", 0)).reshape(-1, 3)
    all_points = np.concatenate([values(p["attributes"]["POSITION"]) for mesh in doc["meshes"] for p in mesh["primitives"]])
    lo, hi = all_points.min(axis=0), all_points.max(axis=0)
    center, span = (lo + hi) / 2, max(hi - lo) * .63
    rotation=np.array([[math.cos(bank),-math.sin(bank),0],[math.sin(bank),math.cos(bank),0],[0,0,1]])
    projection = np.diag([1 / span, 1 / span, -.04, 1])
    actual_eye = np.array(eye) + center
    transform = projection @ view(actual_eye, center, up)
    gl.glViewport(0, 0, size, size)
    gl.glClearColor(0, 0, 0, 0)
    gl.glClear(0x4000 | 0x100)
    gl.glEnable(0xB71)
    gl.glEnable(0xB44)
    gl.glUseProgram(model_program)
    matrix(model_program, "worldViewProjection", transform)
    vector(model_program, "eye", actual_eye)
    for mesh in doc["meshes"]:
        for primitive in mesh["primitives"]:
            material = doc["materials"][primitive["material"]]
            pbr = material["pbrMetallicRoughness"]
            vector(model_program, "baseColor", pbr["baseColorFactor"][:3])
            vector(model_program, "emission", [v*reactor for v in material.get("emissiveFactor", [0, 0, 0])])
            number(model_program, "metallic", pbr["metallicFactor"])
            number(model_program, "roughness", pbr["roughnessFactor"])
            draw(model_program, values(primitive["attributes"]["POSITION"]) @ rotation.T,
                 values(primitive["attributes"]["NORMAL"]) @ rotation.T)
    pixels = np.empty((size, size, 4), dtype=np.uint8)
    gl.glReadPixels(0, 0, size, size, 0x1908, 0x1401, pixels.ctypes.data)
    assert gl.glGetError() == 0
    return Image.fromarray(pixels[::-1])


def shaders():
    js = "global.window={};require('./apps/web/public/games/space-dodger/starfall-space.js');console.log(JSON.stringify(window.StarfallSpace));"
    data = json.loads(subprocess.check_output(["node", "-e", js], cwd=ROOT))
    return data


_sky_program = None


def sky_image(w, h, sector=0):
    """Exercise the shipped image-sampling shader, including its portrait/ultrawide crop."""
    global _sky_program
    source = shaders()
    if _sky_program is None:
        _sky_program = program(source["vertex"], source["fragment"])
        program(source["vertex"], source["planetFragment"])
    p = _sky_program
    with Image.open(GAME / source["SKIES"][sector]["file"]) as file:
        art = np.array(file.convert("RGB"))
    data = np.ascontiguousarray(art[::-1])
    texture = uint()
    gl.glGenTextures(1,C.byref(texture))
    gl.glActiveTexture(0x84C0)
    gl.glBindTexture(0x0DE1,texture)
    for key,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:
        gl.glTexParameteri(0x0DE1,key,value)
    gl.glPixelStorei(0x0CF5,1)
    gl.glTexImage2D(0x0DE1,0,0x1907,art.shape[1],art.shape[0],0,0x1907,0x1401,data.ctypes.data)
    gl.glViewport(0, 0, w, h)
    gl.glClearColor(1, 0, 1, 0)  # Uncovered pixels become an obvious failed assertion.
    gl.glClear(0x4000 | 0x100)
    gl.glDisable(0xB71)
    gl.glDisable(0xB44)
    gl.glUseProgram(p)
    matrix(p, "worldViewProjection", perspective(w / h) @ view((0, 0, 0), (0, 0, 1)))
    gl.glUniform1i(gl.glGetUniformLocation(p,b"skyTexture"),0)
    gl.glUniform2f(gl.glGetUniformLocation(p,b"viewportSize"),w,h)
    gl.glUniform2f(gl.glGetUniformLocation(p,b"imageSize"),art.shape[1],art.shape[0])
    q = [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1]]
    triangles = []
    for a,b,c,d in [(0,1,2,3),(5,4,7,6),(4,0,3,7),(1,5,6,2),(3,2,6,7),(4,5,1,0)]:
        triangles.extend([q[a],q[b],q[c],q[a],q[c],q[d]])
    draw(p, np.array(triangles) * 100)
    pixels = np.empty((h, w, 4), dtype=np.uint8)
    gl.glReadPixels(0, 0, w, h, 0x1908, 0x1401, pixels.ctypes.data)
    gl.glDeleteTextures(1,C.byref(texture))
    assert gl.glGetError() == 0
    result = pixels[::-1].copy()
    assert result[:,:,3].min()==255, "The sky must cover every pixel"
    assert ((result[:,:,:3]>248).all(axis=2)).mean()<.03, "Background must not wash out to white"
    # Compare nine actual GPU samples to bilinear source samples, catching white output, UV flips and stretching.
    iw,ih=art.shape[1],art.shape[0]
    scale=min(iw/w,ih/h)
    for x,y in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,h//2),(w//4,h//4),(3*w//4,h//4),(w//4,3*h//4),(3*w//4,3*h//4)]:
        sx=np.clip((iw-w*scale)/2+(x+.5)*scale-.5,0,iw-1)
        sy=np.clip((ih-h*scale)/2+(y+.5)*scale-.5,0,ih-1)
        x0,y0=int(sx),int(sy);x1,y1=min(iw-1,x0+1),min(ih-1,y0+1)
        fx,fy=sx-x0,sy-y0
        expected=(art[y0,x0]*(1-fx)+art[y0,x1]*fx)*(1-fy)+(art[y1,x0]*(1-fx)+art[y1,x1]*fx)*fy
        assert np.abs(result[y,x,:3].astype(float)-expected).max()<4,(sector,w,h,x,y)
    return Image.fromarray(result)


if __name__ == "__main__":
    if "--review" in sys.argv:
        output = Path(sys.argv[-1])
        output.mkdir(exist_ok=True, parents=True)
        for sector in range(18):
            for w,h in [(1280,720),(390,844),(1600,450)]:
                image=sky_image(w,h,sector)
                if sector in [0,1,13,17]:
                    image.save(output/f"sector-{sector+1}-{w}x{h}.png")
        print("54 background render/crop/colour checks passed across all 18 sectors.")
        contact = Image.new("RGBA", (1536, 1024), "#060e20")
        for i, file in enumerate(["pathfinder.glb","red_scout.glb","siege_fighter.glb","warden_drone.glb","sovereign_citadel.glb","lava_asteroid.glb"]):
            image = model_image(file, eye=(4,5,-7) if i<4 else (3,4,8), up=(0,1,0))
            contact.alpha_composite(image,(i%3*512,i//3*512))
        contact.convert("RGB").save(output / "model-review.png")
        print("Shipped GLES sky/planet shaders compiled; 486 sampled pixels match the sector artwork.")
    else:
        output = GAME / "assets/sprites"
        sets = {"starfall-player-v41.png":["pathfinder.glb"]*4,
                "starfall-enemies-v41.png":["red_scout.glb","warden_drone.glb","red_scout.glb","siege_fighter.glb"],
                "starfall-boss-v41.png":["sovereign_citadel.glb"]*4,
                "starfall-asteroids-v41.png":["lava_asteroid.glb","cryo_shard.glb","lava_asteroid.glb","cryo_shard.glb"]}
        for name, files in sets.items():
            atlas = Image.new("RGBA", (1024, 1024))
            for i, file in enumerate(files):
                player = "player" in name
                eye = (0,9,4) if player else (0,9,-4)
                up = (0,0,-1) if player else (0,0,1)
                image = model_image(file,eye=eye,up=up,bank=([0,.3,-.3,0][i] if player else 0),reactor=2 if player and i==3 else 1)
                atlas.alpha_composite(image,(i%2*512,i//2*512))
            atlas.save(output / name, optimize=True)
            print(output / name)
        # Sector artwork is packaged separately; preserve legacy v4.1 panoramas on disk.
        import hashlib
        files = [*output.glob("starfall-*-v41.png"), *(GAME / "assets/backgrounds").glob("starfall-nebula-*-v41.jpg")]
        manifest = {"revision":"4.1", "source":"Original Starfall GLBs and direction-based nebula shader", "assets":[]}
        for file in sorted(files):
            with Image.open(file) as image:
                manifest["assets"].append({"file":str(file.relative_to(GAME)),"width":image.width,"height":image.height,
                    "bytes":file.stat().st_size,"sha256":hashlib.sha256(file.read_bytes()).hexdigest()})
        (GAME / "assets/visual-assets.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(gl.glGetString(0x1F01).decode())
