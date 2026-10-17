/**
 * Sky Temple 3D — Campaign Depth: authored optional-looking (required relic) detours.
 * No Blender assets are regenerated. Geometry is attached at runtime and the
 * collision world uses exactly the same authored definitions.
 * One world is loaded per page; no background worlds occupy phone memory.
 */
const worldThemes = {
  garden: { top: '#5d9b79', rock: '#33455e', trim: '#d4af6c', glow: '#56e5f0' },
  crystal: { top: '#625b91', rock: '#343454', trim: '#9d91ef', glow: '#c78aff' },
  storm: { top: '#536786', rock: '#27334c', trim: '#b3a6db', glow: '#ac7aff' },
  solar: { top: '#a8a06c', rock: '#565472', trim: '#e4bf73', glow: '#fff0a2' },
};

export const CAMPAIGN_DEPTH = Object.freeze({
  garden: {
    islands: [
      { id: 'moonlit-orchard', x: -15, y: -2, h: 1.58, r: 4.0 },
      { id: 'high-relic-observatory', x: 14, y: 24, h: 3.58, r: 4.2 },
    ],
    bridges: [
      { id: 'orchard-bridge', from: [-9.9,-2,1.58], to: [-12.5,-2,1.58], width: 2.7 },
      { id: 'observatory-bridge', from: [9.5,19.3,3.58], to: [11.8,21.7,3.58], width: 2.7 },
    ],
    relics: [
      { id:'relic-of-the-orchard', label:'Orchard Relic', x:-16, y:-1.8 },
      { id:'relic-of-the-skywatch', label:'Skywatch Relic', x:14.1, y:24.4 },
    ],
    enemies: [
      { name:'Orchard Skimmer', x:-15.8, y:-3.3, phase:4.1, role:'skimmer' },
      { name:'Skywatch Bulwark', x:15.2, y:23.2, phase:6.4, role:'bulwark' },
      { name:'Crown Interceptor', x:17, y:-4, phase:9.1, role:'skimmer' },
    ],
  },
  crystal: {
    islands: [
      { id:'whispering-amethyst', x:-14, y:5, h:1.0, r:4.0 },
      { id:'prismatic-lookout', x:7, y:24, h:2.4, r:4.1 },
    ],
    bridges: [
      { id:'amethyst-bridge', from:[-6.7,2.4,1.0], to:[-11.1,3.8,1.0], width:2.7 },
      { id:'lookout-bridge', from:[8,17,2.4], to:[7.5,21,2.4], width:2.8 },
    ],
    relics: [
      { id:'relic-whisper',label:'Whisper Shard',x:-14.1,y:5.8 },
      { id:'relic-spectrum',label:'Spectrum Prism',x:7.4,y:24.3 },
    ],
    enemies: [
      { name:'Amethyst Skimmer',x:-15,y:4.6,phase:4.1,role:'skimmer' },
      { name:'Prism Bulwark',x:8,y:25,phase:6.4,role:'bulwark' },
      { name:'Cavern Interceptor',x:16,y:-5,phase:9.1,role:'skimmer' },
    ],
  },
  storm: {
    islands: [
      { id:'stormwatch-bastion', x:-14, y:1, h:2.6, r:4.1 },
      { id:'thunder-observatory', x:17, y:27, h:4.2, r:4.4 },
    ],
    bridges: [
      { id:'bastion-bridge', from:[-8.3,-1.1,2.6], to:[-11.1,-.2,2.6], width:2.8 },
      { id:'thunder-observatory-bridge', from:[12,20,4.2], to:[14.7,24.1,4.2], width:2.8 },
    ],
    relics: [
      { id:'relic-tempest',label:'Tempest Shard',x:-14.1,y:1.5 },
      { id:'relic-thunderwatch',label:'Thunderwatch Relic',x:17.1,y:27 },
    ],
    enemies: [
      { name:'Bastion Skimmer',x:-14,y:0,phase:4.1,role:'skimmer' },
      { name:'Thunder Bulwark',x:18,y:27,phase:6.4,role:'bulwark' },
      { name:'Relay Interceptor',x:19,y:-3,phase:9.1,role:'skimmer' },
    ],
  },
  solar: {
    islands: [
      { id:'dawn-archive', x:-17, y:4, h:1.75, r:4.0 },
      { id:'celestial-observatory', x:9, y:28, h:3.15, r:4.4 },
    ],
    bridges: [
      { id:'archive-bridge', from:[-12,1,1.75], to:[-14,2.5,1.75], width:3.1 },
      { id:'celestial-bridge', from:[8,21.2,3.15], to:[8.7,25,3.15], width:3.1 },
    ],
    relics: [
      { id:'relic-solar-archive',label:'Archive Sunstone',x:-17.1,y:4.7 },
      { id:'relic-celestial-crest',label:'Celestial Crest',x:9.1,y:28.1 },
    ],
    enemies: [
      { name:'Dawn Skimmer',x:-17,y:3.1,phase:4.1,role:'skimmer' },
      { name:'Celestial Bulwark',x:10,y:28.4,phase:6.4,role:'bulwark' },
      { name:'Crown Interceptor',x:20,y:2,phase:9.1,role:'skimmer' },
    ],
  },
});

export function enemyMaxHp(role = 'scout') {
  return role === 'bulwark' ? 4 : role === 'skimmer' ? 2 : 3;
}

export function enemyCooldown(role = 'scout') {
  return role === 'bulwark' ? 4.8 : role === 'skimmer' ? 3.5 : 3.8;
}

export function droneOffset(role, t, phase, reducedMotion = false) {
  if (role === 'bulwark') return {
    x: Math.sin(t * .35 + phase) * .55,
    y: Math.cos(t * .31 + phase) * .55,
    h: reducedMotion ? 0 : Math.sin(t * 1.55 + phase) * .11,
  };
  if (role === 'skimmer') return {
    x: Math.sin(t * .95 + phase) * 1.7,
    y: Math.cos(t * .77 + phase) * 1.25,
    h: reducedMotion ? 0 : Math.sin(t * 3.1 + phase) * .18,
  };
  return { x: Math.sin(t*.65+phase)*1.4, y:Math.cos(t*.53+phase)*.8,
    h: reducedMotion ? 0 : Math.sin(t*2.7+phase)*.22 };
}

function colourMaterial(B, scene, name, diffuse, emissive) {
  const mat = new B.StandardMaterial(name, scene);
  mat.diffuseColor = B.Color3.FromHexString(diffuse);
  mat.emissiveColor = B.Color3.FromHexString(emissive);
  return mat;
}

/** Construct only the additional walkable geometry for the active world. */
export function buildCampaignDepth(B, scene, worldKey) {
  const config = CAMPAIGN_DEPTH[worldKey];
  const theme = worldThemes[worldKey];
  if (!config || !theme) throw Error(`Unrecognised Sky Temple campaign world: ${worldKey}`);
  const rock = colourMaterial(B, scene, `${worldKey} extension rock`, theme.rock, '#121a2c');
  const ground = colourMaterial(B, scene, `${worldKey} extension stone`, theme.top, '#0e1a25');
  const trim = colourMaterial(B, scene, `${worldKey} extension ornament`, theme.trim, '#423822');
  const crystal = colourMaterial(B, scene, `${worldKey} extension energy`, theme.glow, theme.glow);
  const surface = (x,y,h) => new B.Vector3(x,h,-y);
  const made=[];
  const register = (mesh, material) => { mesh.material = material; mesh.isPickable = false; made.push(mesh); return mesh; };

  for(const island of config.islands){
    const top = register(B.MeshBuilder.CreateCylinder(`Expedition island ${island.id}`, {
      diameter: island.r*2, height:.32, tessellation:14,
    }, scene), ground);
    top.position = surface(island.x,island.y,island.h-.16);
    const body = register(B.MeshBuilder.CreateCylinder(`Floating rock ${island.id}`, {
      diameterTop:island.r*1.93,diameterBottom:island.r*.48,height:3.5,tessellation:14,
    },scene), rock);
    body.position=surface(island.x,island.y,island.h-1.91);
    const skirt=register(B.MeshBuilder.CreateTorus(`Island gilt trim ${island.id}`, {
      diameter:island.r*1.88,thickness:.10,tessellation:24,
    },scene),trim);
    skirt.position=surface(island.x,island.y,island.h-.24);
    const pedestal=register(B.MeshBuilder.CreateCylinder(`Shrine ${island.id}`, {
      diameter:1.0,height:.35,tessellation:10,
    },scene),trim);
    pedestal.position=surface(island.x+island.r*.62,island.y-island.r*.18,island.h+.18);
    const beacon=register(B.MeshBuilder.CreatePolyhedron(`Relic wayfinding ${island.id}`, {
      type:1,size:.58,
    },scene),crystal);
    beacon.position=surface(island.x+island.r*.62,island.y-island.r*.18,island.h+1.2);
  }
  for(const bridge of config.bridges){
    const [ax,ay,ah]=bridge.from,[bx,by,bh]=bridge.to;
    const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);
    const angle=-Math.atan2(dx,dy);
    const slab=register(B.MeshBuilder.CreateBox(`Expedition bridge ${bridge.id}`,{
      width:bridge.width,depth:length,height:.30,
    },scene),ground);
    slab.position=surface((ax+bx)/2,(ay+by)/2,(ah+bh)/2-.15);
    slab.rotation.y=angle;
    // Inexpensive pair of rails, no physics mesh needed for collision.
    for(const side of [-1,1]){
      const rail=register(B.MeshBuilder.CreateBox(`Sky bridge guard ${bridge.id} ${side}`,{
        width:.12,depth:length,height:.25,
      },scene),trim);
      // local +/-X offset after y rotation.
      const lateral=side*(bridge.width*.5-.11);
      rail.position=surface((ax+bx)/2+Math.cos(angle)*lateral,
        (ay+by)/2+Math.sin(angle)*lateral,(ah+bh)/2+.22);
      rail.rotation.y=angle;
    }
  }
  return {
    meshCount: made.length,
    dispose(){ made.forEach(m=>m.dispose()); [rock,ground,trim,crystal].forEach(m=>m.dispose()); },
  };
}
