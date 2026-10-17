/* Runs the shipped game logic; DOM/input adapters do not emulate browser CSS layout. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '../../public/games/kasi-quest');
async function boot({ width = 1280, height = 720, saved = new Map(), failAssets = false, failLevels = false, failAtlases = [], wrongAtlasSize = false, noAnimation = false, nativeCanvas } = {}) {
  let clock = 0;
  const frames = [];
  const calls = [], messages = [], requests = [], captures = new Set();
  let doc;
  class Element {
    constructor(tag = 'div', attrs = {}) {
      this.tagName = tag.toUpperCase(); this.attrs = attrs; this.id = attrs.id; this.hidden = 'hidden' in attrs;
      this.style = { setProperty(k,v) { this[k] = v; } }; this.dataset = {}; this.events = {}; this.children = [];
      this.textContent = ''; this.disabled = false; this.classSet = new Set();
      this.classList = { add: k => this.classSet.add(k), remove: k => this.classSet.delete(k),
        contains: k => this.classSet.has(k), toggle: (k,on) => on ?? !this.classSet.has(k) ? this.classSet.add(k) : this.classSet.delete(k) };
    }
    addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
    emit(k, props = {}) { const e = { target:this, key:'', pointerId:1, pointerType:'touch', button:0, preventDefault() { this.prevented = true; }, ...props }; for (const fn of this.events[k] || []) fn(e); return e; }
    click() { if (!this.disabled) this.emit('click'); }
    setAttribute(k,v) { this.attrs[k] = v; }
    appendChild(el) { this.children.push(el); return el; }
    get innerHTML() { return this.html || ''; }
    set innerHTML(v) { this.html = v; this.children = []; }
    querySelector() { return this.star ??= new Element('span'); }
    focus() { doc.activeElement = this; }
    setPointerCapture(id) { captures.add(id); }
    hasPointerCapture(id) { return captures.has(id); }
    releasePointerCapture(id) { captures.delete(id); this.emit('lostpointercapture', { pointerId:id }); }
    getBoundingClientRect() {
      if (this.id === 'c') return { x:0, y:0, top:0, left:0, width:win.innerWidth, height:win.innerHeight, bottom:win.innerHeight };
      if (this.id === 'hud') return { top:8, bottom:52, height:44 };
      if (this.id === 'missionHud') return { top:60, bottom:92, height:32 };
      if (this.id?.startsWith('btn')) return { top:win.innerHeight-80, bottom:win.innerHeight-16, height:64, width:64 };
      return { top:0, bottom:0, height:0, width:0 };
    }
  }
  class Context {}
  Context.prototype.roundRect = function() {};
  const ctx = nativeCanvas ? nativeCanvas.getContext('2d') : new Proxy(new Context(), { get(target, key) {
    if (key in target) return target[key];
    if (key === 'measureText') return s => ({ width:String(s).length*8 });
    if (key === 'createLinearGradient') return () => ({ addColorStop() {} });
    return (...args) => calls.push([key, ...args]);
  } });
  const elements = new Map();
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)) {
    const attrs = {}; for (const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? '';
    if (attrs.id) elements.set(attrs.id, new Element(m[1], attrs));
  }
  const canvas = elements.get('c');
  canvas.getContext = () => ctx;
  if (nativeCanvas) for (const key of ['width', 'height']) Object.defineProperty(canvas, key, { get:() => nativeCanvas[key], set:v => { nativeCanvas[key] = v; } });
  doc = new Element(); doc.hidden = false; doc.documentElement = new Element('html'); doc.body = new Element('body');
  doc.getElementById = id => elements.get(id); doc.createElement = tag => new Element(tag);
  const win = new Element(); Object.assign(win, { innerWidth:width, innerHeight:height, devicePixelRatio:2, visualViewport:new Element(), location:{ origin:'https://webgamearena.com' }, setInterval:() => 1,
    setTimeout, clearTimeout, matchMedia:() => ({matches:false,addEventListener(){}}) });
  win.parent = win; win.postMessage = (message, origin) => messages.push({ message, origin });
  const sandbox = { window:win, document:doc, console, performance:{ now:() => clock },
    CanvasRenderingContext2D: Context, localStorage:{ getItem:k => saved.get(k) ?? null, setItem:(k,v) => saved.set(k,String(v)) },
    requestAnimationFrame:fn => { frames.push(fn); },
    fetch: async url => { const p = path.join(root, url); return { ok:!failLevels, status:failLevels ? 503 : 200, json:async () => JSON.parse(fs.readFileSync(p, 'utf8')) }; },
    Image: class {
      set src(url) {
        this.url = url;
        requests.push(url);
        const png = fs.readFileSync(path.join(root,url));
        this.width = png.readUInt32BE(16); this.height = png.readUInt32BE(20);
        if (wrongAtlasSize && url.includes('/animation/')) this.width+=1;
        queueMicrotask(() => { if (failAssets || failAtlases.some(kind=>url.includes(`/animation/${kind}-`))) this.onerror?.(); else if (nativeCanvas) {
          const { loadImage } = require('@napi-rs/canvas');
          loadImage(path.join(root,url)).then(img => {
            this.width=img.width; this.height=img.height; images.set(this,img); this.onload?.();
          }).catch(error => this.onerror?.(error));
        } else this.onload?.(); });
      }
    },
  };
  const images = new Map();
  if (nativeCanvas) { const draw = ctx.drawImage.bind(ctx); ctx.drawImage = (img,...args) => draw(images.get(img) || img,...args); }
  const context = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'kasi-presentation.js'), 'utf8'), context);
  if (!noAnimation) {
    vm.runInContext(fs.readFileSync(path.join(root, 'kasi-animation-data.js'), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(root, 'kasi-animation.js'), 'utf8'), context);
  }
  let code = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  code = code.replace('  void boot();', `
    globalThis.__kasiProbe = { player, input, prevInput, presentation, animation, updateActorAnimations, resetInput, fitCanvas, computeCamera,
      startOrRestart, startDaily, setPaused, resetLevelState, updatePlayer, updateGameplay, updateObstacles,
      updateEnemies, updateBosses, updateProjectiles, handleEnemyPlayerCollisions, damagePlayer,
      collectCoin, collectCollectible, hitBoss, defeatEnemy, pressSwitch, objectiveComplete,
      completeLevel, loadLevel, render, shoot, postScore,
      get state() { return { running, paused, loading, currentLevel, level, score, wallet, stars, upgrades,
        enemies, bosses, obstacles, switches, doors, projectiles, enemyProjectiles, levelTime, display, cameraInsets, defeatRemaining }; }
    }; globalThis.__kasiReady = boot();`);
  vm.runInContext(code, context, { filename:'kasi-quest/game.js' });
  await context.__kasiReady;
  const probe = context.__kasiProbe;
  return { ...probe, get state() { return probe.state; }, elements, win, doc, ctx, calls, saved, messages, requests, captures,
    frame(ms = 1000/60) { clock += ms; const pending=frames.splice(0); for(const fn of pending) fn(); },
    resize(w,h) { win.innerWidth=w; win.innerHeight=h; win.visualViewport.height=h; win.visualViewport.emit('resize'); },
  };
}
module.exports = { boot, root };
