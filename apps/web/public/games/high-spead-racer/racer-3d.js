/* Original neon presentation layer. Gameplay, collisions and progression stay in game.js. */
(() => {
  'use strict';
  const qualityFor = (win = window) => {
    const compact = win.matchMedia?.('(pointer: coarse)').matches || win.innerWidth < 760;
    return { compact: Boolean(compact), pixelRatio: compact ? 1.25 : 1.75,
      skylineCount: compact ? 14 : 24, sceneryCount: compact ? 26 : 40,
      reducedMotion: Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) };
  };
  function create({ app, root, camera, pc, quality }) {
    const objects = [], skylineAssets = [], shadowCars = new Set(), streetObjects = [];
    const streetAssets = new Map(), streetPending = new Set();
    const STREETS = new Set(['harbour','oldtown','industrial','tunnel','airport','skyway']);
    let streetEnv = null;
    let env = 'coast';
    const soft = document.createElement('canvas'); soft.width = soft.height = 64;
    const ctx = soft.getContext('2d');
    const g = ctx.createRadialGradient(32,32,1,32,32,31);
    g.addColorStop(0,'rgba(0,0,0,.72)'); g.addColorStop(.5,'rgba(0,0,0,.42)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
    const texture = new pc.Texture(app.graphicsDevice,{width:64,height:64,mipmaps:false}); texture.setSource(soft);
    const shadowMaterial = new pc.StandardMaterial(); shadowMaterial.diffuse.set(0,0,0);
    shadowMaterial.opacityMap=texture; shadowMaterial.opacityMapChannel='a';
    shadowMaterial.blendType=pc.BLEND_NORMAL; shadowMaterial.depthWrite=false;
    shadowMaterial.useLighting=false; shadowMaterial.update();
    const accent = (name,color,intensity,x) => {
      const light=new pc.Entity(name); light.addComponent('light',{type:'omni',color:new pc.Color(...color),intensity,range:22,castShadows:false});
      light.setLocalPosition(x,4,10); root.addChild(light); return light;
    };
    const cyan=accent('Cyan rim',[.10,.62,1],1.4,-7), pink=accent('Magenta rim',[1,.03,.3],1.2,7);
    app.scene.ambientLight=new pc.Color(.24,.28,.38);
    app.scene.exposure=1.25;

    // A small, once-generated IBL atlas puts light strips in the paint and wet road.
    // No realtime mirrors, shadow maps or external environment downloads on phones.
    if (!app.graphicsDevice.isNull && pc.EnvLighting) {
      let cube,lighting;
      try {
        const faces=Array.from({length:6},(_,face)=>{
          const c=document.createElement('canvas'); c.width=c.height=64;
          const p=c.getContext('2d'), grad=p.createLinearGradient(0,0,0,64);
          grad.addColorStop(0,'#435879'); grad.addColorStop(.48,'#151c32'); grad.addColorStop(1,'#03060c');
          p.fillStyle=grad; p.fillRect(0,0,64,64);
          p.fillStyle=face%2?'#fa246f':'#26c4ef'; p.fillRect(8,7,3,46); p.fillRect(43,14,2,36);
          p.fillStyle='#c3e5f7'; p.fillRect(3,5,57,3); return c;
        });
        cube=new pc.Texture(app.graphicsDevice,{name:'Neon reflection source',width:64,height:64,cubemap:true,mipmaps:true});
        cube.setSource(faces);
        lighting=pc.EnvLighting.generateLightingSource(cube,{size:64});
        app.scene.envAtlas=pc.EnvLighting.generateAtlas(lighting,{numReflectionSamples:32,numAmbientSamples:32});
      } catch (error) { console.warn('Environment reflections unavailable; direct lighting retained.',error); }
      finally { lighting?.destroy(); cube?.destroy(); }
    }

    if (!quality.compact && !quality.reducedMotion && !app.graphicsDevice.isNull) {
      try {
        camera.addComponent('script');
        camera.script.create('bloom',{attributes:{bloomIntensity:.35,bloomThreshold:.82,blurAmount:3}});
      } catch (error) { console.warn('Bloom unavailable; standard rendering retained.',error); }
    }
    function attachCar(car) {
      if (!car || car.neonShadow) return;
      const shadow=new pc.Entity('Vehicle contact shadow');
      shadow.addComponent('render',{type:'plane',material:shadowMaterial,castShadows:false,receiveShadows:false});
      shadow.setLocalScale(3.5,1,6.3); shadow.setLocalPosition(0,.026,0);
      car.addChild(shadow); car.neonShadow=shadow; shadowCars.add(car);
      car.once('destroy',()=>shadowCars.delete(car));
    }
    function rebuildSkyline() {
      objects.splice(0).forEach(e=>e.destroy());
      if (!skylineAssets.length) return;
      for(let i=0;i<quality.skylineCount;i++) {
        const asset=skylineAssets[i%skylineAssets.length];
        const entity=asset.resource.instantiateRenderEntity({castShadows:false});
        entity.name='Distant neon skyline'; root.addChild(entity);
        const side=i%2?1:-1;
        entity.skylineX=side*(28+(i%4)*8); entity.skylineZ=-25-Math.floor(i/2)*29;
        const scale=.75+(i%5)*.20; entity.setLocalScale(scale,scale*(.9+(i%3)*.25),scale);
        entity.setLocalPosition(entity.skylineX,-.1,entity.skylineZ); objects.push(entity);
      }
      theme(env);
    }
    ['skyline_cyan.glb','skyline_magenta.glb'].forEach(file=>{
      app.assets.loadFromUrl(`assets/models/neon/${file}`,'container',(error,asset)=>{
        if(error) {console.warn('Skyline asset unavailable',file); return;}
        skylineAssets.push(asset); rebuildSkyline();
      });
    });
    function theme(next) {
      env=next;
      const city=['coast','metro','final','harbour','oldtown','industrial','airport','skyway'].includes(env);
      objects.forEach(e=>{e.enabled=city;});
      cyan.light.intensity=city?1.4:.8; pink.light.intensity=city?1.2:.4;
      const colors={oldtown:[[1,.45,.12],[1,.12,.08]],industrial:[[1,.2,.05],[1,.03,.08]],
        airport:[[.32,.65,1],[.7,.8,1]],tunnel:[[.04,.7,1],[.4,.08,1]]}[env]||[[.10,.62,1],[1,.03,.3]];
      cyan.light.color=new pc.Color(...colors[0]);pink.light.color=new pc.Color(...colors[1]);
      app.scene.ambientLight=new pc.Color(...(env==='tunnel'?[.13,.18,.26]:env==='oldtown'?[.34,.27,.24]:[.24,.28,.38]));
      buildStreet(next);
    }
    function buildStreet(next) {
      if(streetEnv!==next){streetObjects.splice(0).forEach(e=>e.destroy());streetEnv=next;}
      if(!STREETS.has(next)||streetObjects.length)return;
      const asset=streetAssets.get(next);
      if(!asset){
        if(streetPending.has(next))return;
        streetPending.add(next);
        app.assets.loadFromUrl(`assets/models/streets/${next}.glb`,'container',(error,loaded)=>{
          streetPending.delete(next);
          if(error){console.warn('Street scenery unavailable',next);return;}
          streetAssets.set(next,loaded);if(env===next)buildStreet(next);
        });return;
      }
      const centered=next==='tunnel'||next==='skyway', count=quality.compact?10:16;
      for(let i=0;i<count;i++){
        const e=asset.resource.instantiateRenderEntity({castShadows:false});e.name=`Street ${next} ${i}`;
        root.addChild(e);const side=i%2?1:-1;
        e.streetSpacing=next==='tunnel'?24:next==='skyway'?40:30;
        e.streetCount=count;e.setLocalPosition(centered?0:side*(19+(i%3)*3),.02,12-i*e.streetSpacing);
        if(!centered)e.setLocalEulerAngles(0,side>0?-90:90,0);
        streetObjects.push(e);
      }
    }
    function update(dt,state,player) {
      const animate=state.mode==='running';
      if(animate) objects.forEach(e=>{
        const p=e.getLocalPosition(); p.z+=state.roadSpeed*dt*.28;
        if(p.z>40) p.z-=Math.max(400,Math.ceil(quality.skylineCount/2)*29);
        e.setLocalPosition(p);
      });
      if(animate) streetObjects.forEach(e=>{
        const p=e.getLocalPosition();p.z+=state.roadSpeed*dt;
        if(p.z>48)p.z-=e.streetSpacing*e.streetCount;e.setLocalPosition(p);
      });
      if(player) {
        const p=player.getLocalPosition();
        cyan.setLocalPosition(p.x-7,3,p.z+2); pink.setLocalPosition(p.x+7,3,p.z-3);
      }
      for (const car of shadowCars) {
        if(car.neonShadow) car.neonShadow.setLocalPosition(0,.026-car.getLocalPosition().y,0);
      }
    }
    return {attachCar,theme,update,quality,streetObjects};
  }
  window.Racer3D={qualityFor,create};
})();
