const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,B,root}=require('./helpers/starfall-runtime.cjs');
const wait=()=>new Promise(resolve=>setTimeout(resolve,150));
async function close(r){await wait();r.scene?.dispose();r.engine?.dispose();}

test('the sky encloses all camera corner rays on portrait, landscape and ultrawide screens',async()=>{
 for(const [width,height] of [[390,844],[844,390],[1920,1080],[2560,720]]){
  const r=boot({width,height});await wait();r.scene.render();
  const sky=r.space.sky;sky.computeWorldMatrix(true);
  assert.equal(sky.infiniteDistance,true);assert.equal(sky.material.alpha,1);assert.equal(sky.material.backFaceCulling,false);
  assert.equal(sky.applyFog,false);assert.equal(sky.material.disableDepthWrite,true);
  assert.equal(r.scene.meshes.filter(mesh=>mesh.name.startsWith('spaceBackgroundLayer')).length,0);
  // A ray from every viewport corner hits the continuous sky before the camera far plane.
  const center=sky.getBoundingInfo().boundingSphere.centerWorld,radius=300;
  for(const [x,y] of [[0,0],[width,0],[0,height],[width,height],[width/2,height/2]]){
   const ray=r.scene.createPickingRay(x,y,B.Matrix.Identity(),r.camera,false);
   const offset=ray.origin.subtract(center),b=B.Vector3.Dot(offset,ray.direction);
   const distance=-b+Math.sqrt(b*b-(offset.lengthSquared()-radius*radius));
   assert.ok(distance>r.camera.minZ&&distance<r.camera.maxZ,`${width}x${height} at ${x},${y}`);
  }
  await close(r);
 }
});

test('space motion advances toward the camera while distant sky and planets remain anchored; pause freezes travel',async()=>{
 const r=boot();await wait();r.startGame();await wait();
 const old=r.pools.stars.map(s=>s.position.clone());
 const planets=r.planetMeshes.map(p=>p.mesh.position.clone());
 const sky=r.space.sky.position.clone(),texture=r.space.texture;
 r.updateWorld(.1);
 r.pools.stars.forEach((star,i)=>{assert.equal(star.position.x,old[i].x);assert.equal(star.position.y,old[i].y);assert.ok(star.position.z<old[i].z);});
 r.planetMeshes.forEach((planet,i)=>assert.ok(planet.mesh.position.equals(planets[i])));
 assert.ok(r.space.sky.position.equals(sky));assert.equal(texture.uOffset,0);assert.equal(texture.vOffset,0);
 assert.equal(texture.wrapU,B.Texture.CLAMP_ADDRESSMODE);assert.equal(texture.wrapV,B.Texture.CLAMP_ADDRESSMODE);
 r.elements.get('pauseBtn').click();const z=r.pools.stars[0].position.z;r.step(3);assert.equal(r.pools.stars[0].position.z,z);
 // Advancing through every sector retains one panorama, with no accumulating background planes/textures.
 for(let i=0;i<18;i++)r.beginLevel(i);
 assert.equal(r.scene.textures.filter(t=>t.url?.includes('assets/backgrounds/sectors/')).length,1);
 await close(r);
});

test('compatibility flight covers the whole viewport and redraws never move its sky or stars',()=>{
 const r=boot({webgl:false,width:390,height:844});
 global.Image=class{constructor(){this.complete=true;this.naturalWidth=2048;this.naturalHeight=1024;}};
 r.startGameFallback();const before=JSON.stringify(r.fb.stars);r.drawFallback();r.drawFallback();
 assert.equal(JSON.stringify(r.fb.stars),before);
 const calls=r.elements.get('renderCanvas').context.calls;
 const panorama=calls.filter(c=>c[0]==='drawImage'&&c.length===10).at(-1);
 assert.ok(panorama);assert.deepEqual(panorama.slice(-4),[0,0,390,844]);
 assert.ok(panorama[2]>=0&&panorama[3]>=0&&panorama[4]<=2048&&panorama[5]<=1024);
 r.updateFallback(.02);assert.notEqual(JSON.stringify(r.fb.stars),before);
 const paused=JSON.stringify(r.fb.stars);r.elements.get('pauseBtn').click();r.updateFallback(2);r.drawFallback();assert.equal(JSON.stringify(r.fb.stars),paused);
});

test('compatibility star parallax expands from one vanishing point along the forward flight axis',()=>{
 boot({webgl:false});const S=window.StarfallSpace,stars=[{x:12,y:8,z:70}];
 const a=S.projectStar(stars[0],1280,720);S.advanceStars(stars,.2);const b=S.projectStar(stars[0],1280,720);
 assert.equal(stars[0].x,12);assert.equal(stars[0].y,8);assert.ok(b.x>a.x&&b.y>a.y&&b.r>a.r);
 const normal=stars[0].z;S.advanceStars(stars,.2,true);assert.ok(normal-stars[0].z>3.6);
});

test('every baked panorama and compatibility atlas has its declared dimensions, reference and hash',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/visual-assets.json')));
 assert.equal(manifest.assets.length,10);
 for(const asset of manifest.assets){
  const bytes=fs.readFileSync(path.join(root,asset.file));assert.equal(bytes.length,asset.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.ok(bytes.length<900000);
  if(asset.file.endsWith('.png')){assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1024);}
  else {assert.equal(asset.width,2048);assert.equal(asset.height,1024);assert.equal(bytes.readUInt16BE(0),0xffd8);}
 }
 const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
 for(const asset of manifest.assets.filter(a=>a.file.endsWith('.png')))assert.ok(game.includes(asset.file));
});

test('eighteen distinct sector images bind directly to an unlit shader excluded from reactor glow',async()=>{
 const r=boot();await wait();const S=window.StarfallSpace;
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/backgrounds/sectors/manifest.json')));
 assert.equal(S.SKIES.length,18);assert.equal(manifest.assets.length,18);
 assert.equal(new Set(manifest.assets.map(a=>a.sha256)).size,18);
 for(let i=0;i<18;i++){
  const item=manifest.assets[i];assert.equal(item.name,r.LEVELS[i].name);assert.equal(S.sector(i).file,item.file);
  const bytes=fs.readFileSync(path.join(root,item.file));assert.equal(bytes.length,item.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
  assert.ok(item.mean_rgb>10&&item.mean_rgb<170&&item.near_white_fraction<.03);
  r.beginLevel(i);assert.equal(r.space.texture.url,item.file);
  assert.ok(r.space.material.getActiveTextures().includes(r.space.texture));assert.equal(r.space.texture.requestInvertY,true);
  assert.ok(r.scene.effectLayers.every(layer=>!layer.hasMesh(r.space.sky)),'the sky cannot fill the bloom buffer');
 }
 assert.ok(r.space.material instanceof B.ShaderMaterial);
 assert.ok(S.fragment.includes('texture2D(skyTexture,uv).rgb,1.'));
 assert.equal(r.scene.textures.filter(t=>t.url?.includes('assets/backgrounds/sectors/')).length,1);
 await close(r);
});

test('slow, failed and stale sky downloads retain a safe image and release replaced textures',async()=>{
 const r=boot({deferTextures:true});await wait();const initial=r.space.texture,first=r.space.pending;
 r.space.theme(1);const second=r.space.pending;assert.ok(first.disposed);first.finish();assert.equal(r.space.texture,initial);
 second.finish();assert.equal(r.space.texture,second);assert.equal(r.space.pending,null);
 r.space.theme(2);const failed=r.space.pending;failed.failLoad();assert.equal(r.space.texture,second);assert.ok(failed.disposed);
 r.space.theme(2);const retry=r.space.pending;retry.finish();assert.equal(r.space.texture,retry);assert.ok(second.disposed);
 r.space.theme(3);const pending=r.space.pending;await close(r);assert.ok(pending.disposed);assert.ok(retry.disposed);
 pending.finish();assert.equal(r.space.pending,pending,'a late callback cannot rebind a disposed scene');
});

test('every sector uses one covering image on phones, desktop and ultrawide screens',()=>{
 const r=boot({webgl:false});const S=window.StarfallSpace;
 global.Image=class{constructor(){this.complete=true;this.naturalWidth=1672;this.naturalHeight=941;}};
 const ctx=r.elements.get('renderCanvas').getContext('2d');
 for(let i=0;i<18;i++)for(const [width,height] of [[390,844],[1280,720],[2560,720]]){
  ctx.calls.length=0;r.fallbackSky.draw(ctx,width,height,i,r.LEVELS[i].hue);
  const call=ctx.calls.filter(c=>c[0]==='drawImage'&&c.length===10).at(-1);
  assert.equal(call[1].src,S.sector(i).file);assert.deepEqual(call.slice(-4),[0,0,width,height]);
  const crop=S.coverRect(1672,941,width,height);
  assert.ok(crop.x>=0&&crop.y>=0);assert.ok(crop.x+crop.width<=1672.001&&crop.y+crop.height<=941.001);
  assert.ok(Math.abs(crop.width/crop.height-width/height)<.0001);
 }
});
