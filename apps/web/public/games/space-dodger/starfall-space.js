/* A stationary, seamless sky. Only nearby stars/debris advance along the flight axis. */
(() => {
  'use strict';
  const vertex = `precision highp float;
    attribute vec3 position;
    uniform mat4 worldViewProjection;
    varying vec3 vDirection;
    void main(){vDirection=position;gl_Position=worldViewProjection*vec4(position,1.0);}`;
  const noise = `
    float hash(vec3 p){p=fract(p*.3183099+vec3(.11,.23,.37));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+vec3(7.1,3.4,1.8);a*=.5;}return v;}`;
  // Sample the backdrop directly; scene lights, fog and emissive extraction never recolour it.
  const fragment = `precision highp float;
    uniform sampler2D skyTexture;
    uniform vec2 viewportSize;
    uniform vec2 imageSize;
    void main(){
      vec2 viewport=max(viewportSize,vec2(1.));
      float screenAspect=viewport.x/viewport.y;
      float artAspect=imageSize.x/max(1.,imageSize.y);
      vec2 crop=vec2(min(1.,screenAspect/artAspect),min(1.,artAspect/screenAspect));
      vec2 uv=(gl_FragCoord.xy/viewport-.5)*crop+.5;
      gl_FragColor=vec4(texture2D(skyTexture,uv).rgb,1.);
    }`;
  const SKIES=Object.freeze([
  {
    "name": "Launch Corridor",
    "file": "assets/backgrounds/sectors/01-launch-corridor.jpg"
  },
  {
    "name": "Meteor Scar",
    "file": "assets/backgrounds/sectors/02-meteor-scar.jpg"
  },
  {
    "name": "Nebula Gate",
    "file": "assets/backgrounds/sectors/03-nebula-gate.jpg"
  },
  {
    "name": "Drone Forge",
    "file": "assets/backgrounds/sectors/04-drone-forge.jpg"
  },
  {
    "name": "Comet Rapids",
    "file": "assets/backgrounds/sectors/05-comet-rapids.jpg"
  },
  {
    "name": "Pirate Signal",
    "file": "assets/backgrounds/sectors/06-pirate-signal.jpg"
  },
  {
    "name": "Crystal Rift",
    "file": "assets/backgrounds/sectors/07-crystal-rift.jpg"
  },
  {
    "name": "Mothership Shadow",
    "file": "assets/backgrounds/sectors/08-mothership-shadow.jpg"
  },
  {
    "name": "Solar Furnace",
    "file": "assets/backgrounds/sectors/09-solar-furnace.jpg"
  },
  {
    "name": "Black Star Run",
    "file": "assets/backgrounds/sectors/10-black-star-run.jpg"
  },
  {
    "name": "Starfall Siege",
    "file": "assets/backgrounds/sectors/11-starfall-siege.jpg"
  },
  {
    "name": "Odyssey Finale",
    "file": "assets/backgrounds/sectors/12-odyssey-finale.jpg"
  },
  {
    "name": "Echoes of Asterion",
    "file": "assets/backgrounds/sectors/13-echoes-of-asterion.jpg"
  },
  {
    "name": "Ion Tempest",
    "file": "assets/backgrounds/sectors/14-ion-tempest.jpg"
  },
  {
    "name": "Relay Breaker",
    "file": "assets/backgrounds/sectors/15-relay-breaker.jpg"
  },
  {
    "name": "Ark of the Dawn",
    "file": "assets/backgrounds/sectors/16-ark-of-the-dawn.jpg"
  },
  {
    "name": "Singularity Crossing",
    "file": "assets/backgrounds/sectors/17-singularity-crossing.jpg"
  },
  {
    "name": "Heart of Starfall",
    "file": "assets/backgrounds/sectors/18-heart-of-starfall.jpg"
  }
].map(Object.freeze));
  function sector(index){return SKIES[Math.max(0,Math.min(SKIES.length-1,Math.floor(Number(index)||0)))];}
  function coverRect(iw,ih,w,h){
    const scale=Math.min(iw/Math.max(1,w),ih/Math.max(1,h));
    const width=Math.min(iw,w*scale),height=Math.min(ih,h*scale);
    return {x:Math.max(0,(iw-width)/2),y:Math.max(0,(ih-height)/2),width,height};
  }
  const planetFragment = `precision highp float;
    varying vec3 vDirection;
    uniform vec3 surfaceHue;
    uniform float ice;
    ${noise}
    void main(){vec3 n=normalize(vDirection);float terrain=fbm(n*5.2);
      float detail=fbm(n*22.);float bands=smoothstep(.38,.62,terrain+detail*.12);
      vec3 land=mix(surfaceHue*.26,surfaceHue*1.15,bands);
      land=mix(land,vec3(.68,.85,.94),ice*smoothstep(.46,.72,terrain));
      float clouds=smoothstep(.58,.75,fbm(n*8.+4.));land=mix(land,vec3(.7,.8,.89),clouds*.55);
      float sun=max(0.,dot(n,normalize(vec3(-.65,.5,-.9))));
      vec3 lit=land*(.035+sun*.92);float limb=pow(1.-abs(n.z),3.);
      lit+=surfaceHue*limb*.17*smoothstep(-.3,.3,dot(n,vec3(-.5,.3,-1.)));
      gl_FragColor=vec4(lit,1.);}`;

  function create(B,scene){
    B.Effect.ShadersStore.starfallSkyVertexShader=vertex;
    B.Effect.ShadersStore.starfallSkyFragmentShader=fragment;
    B.Effect.ShadersStore.starfallPlanetVertexShader=vertex;
    B.Effect.ShadersStore.starfallPlanetFragmentShader=planetFragment;
    const sky=B.MeshBuilder.CreateSphere('Infinite Starfall sky',{diameter:600,segments:16},scene);
    sky.infiniteDistance=true;sky.isPickable=false;sky.alwaysSelectAsActiveMesh=true;sky.applyFog=false;
    const material=new B.ShaderMaterial('Starfall artwork',scene,'starfallSky',{
      attributes:['position'],uniforms:['worldViewProjection','viewportSize','imageSize'],samplers:['skyTexture']
    });
    material.backFaceCulling=false;material.disableDepthWrite=true;sky.material=material;
    // A sky-sized glow source can bleach the whole image. Background pixels never enter bloom.
    for(const layer of scene.effectLayers||[])layer.addExcludedMesh?.(sky);
    const fallback=new B.RawTexture(new Uint8Array([5,9,23,255]),1,1,B.Engine.TEXTUREFORMAT_RGBA,scene,false,false,B.Texture.NEAREST_SAMPLINGMODE);
    material.setTexture('skyTexture',fallback);material.setVector2('imageSize',new B.Vector2(16,9));
    let texture=fallback,pending=null,currentSector=-1,generation=0,disposed=false;
    function viewport(){
      material.setVector2('viewportSize',new B.Vector2(scene.getEngine().getRenderWidth(),scene.getEngine().getRenderHeight()));
    }
    material.onBindObservable.add(viewport);viewport();
    function theme(index){
      const i=Math.max(0,Math.min(SKIES.length-1,Math.floor(Number(index)||0)));
      if(i===currentSector)return;currentSector=i;const token=++generation;
      pending?.dispose();pending=null;
      const candidate=new B.Texture(sector(i).file,scene,false,true,B.Texture.TRILINEAR_SAMPLINGMODE,undefined,()=>{
        if(token!==generation||disposed)return;
        pending=null;candidate.dispose();currentSector=-1;
      });
      candidate.wrapU=B.Texture.CLAMP_ADDRESSMODE;candidate.wrapV=B.Texture.CLAMP_ADDRESSMODE;
      candidate.anisotropicFilteringLevel=2;pending=candidate;
      const accept=()=>{
        if(disposed||token!==generation)return;
        const old=texture;texture=candidate;pending=null;
        material.setTexture('skyTexture',candidate);
        // Base dimensions preserve the artwork's aspect even if WebGL 1 resizes a GPU texture.
        const size=candidate.getBaseSize();material.setVector2('imageSize',new B.Vector2(size.width,size.height));
        if(old!==fallback&&old!==candidate)old.dispose();
      };
      candidate.onLoadObservable.addOnce(accept);
      if(candidate.isReady())accept();
    }
    function planet(mesh,hue,icy=false){
      const mat=new B.ShaderMaterial(mesh.name+' surface',scene,'starfallPlanet',{
        attributes:['position'],uniforms:['worldViewProjection','surfaceHue','ice']
      });
      mat.setColor3('surfaceHue',B.Color3.FromHexString(hue));mat.setFloat('ice',icy?1:0);mesh.material=mat;
      mat.onError=()=>{if(scene.isDisposed||mesh.isDisposed())return;
        const fallback=new B.StandardMaterial(mesh.name+' lit surface',scene);fallback.diffuseColor=B.Color3.FromHexString(hue);mesh.material=fallback;
      };
    }
    theme(0,'#36dfff');
    scene.onDisposeObservable.add(()=>{disposed=true;++generation;pending?.dispose();if(texture!==fallback)texture.dispose();fallback.dispose();});
    return {sky,material,theme,planet,viewport,get texture(){return texture;},get pending(){return pending;}};
  }

  // The compatibility sky is cached at viewport size, never tiled, blended with other posters or scrolled.
  function canvasSky(){
    let canvas=null,key='',imageKey=-1,image=null;
    function draw(ctx,w,h,index,hue){
      const asset=sector(index);
      if(imageKey!==asset.file){image=new Image();image.decoding='async';image.src=asset.file;imageKey=asset.file;}
      const next=[w,h,index,hue].join(':');
      if(next!==key){
        canvas=document.createElement('canvas');const scale=Math.min(1,1536/Math.max(w,h));
        canvas.width=Math.ceil(w*scale);canvas.height=Math.ceil(h*scale);const c=canvas.getContext('2d');
        const width=canvas.width,height=canvas.height;let seed=0x43f9+index*97;
        const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
        c.fillStyle='#020510';c.fillRect(0,0,width,height);
        // Soft cloud banks at several scales have no visible rectangular boundary.
        const palette=['#153a6c','#37194f','#123f5a',hue];
        for(let i=0;i<110;i++){
          const x=rand()*width*1.6-width*.3,y=rand()*height*1.4-height*.2;
          const r=Math.max(width,height)*(.07+rand()*.28),g=c.createRadialGradient(x,y,0,x,y,r);
          g.addColorStop(0,palette[i%4]);g.addColorStop(1,'#02051000');
          c.globalAlpha=.025+rand()*.045;c.fillStyle=g;c.fillRect(0,0,width,height);
        }
        c.globalAlpha=1;
        for(let i=0;i<320;i++){
          const x=rand()*width,y=rand()*height,r=.3+rand()*.55;
          c.globalAlpha=.15+rand()*.6;c.fillStyle=i%7?'#a4bfdc':'#f5d9b3';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
        }
        c.globalAlpha=1;key=next;
      }
      ctx.drawImage(canvas,0,0,w,h);
      if(image.complete&&image.naturalWidth){
        // A stable centred crop of one panorama. Always cover the viewport, including ultrawide/portrait.
        const crop=coverRect(image.naturalWidth,image.naturalHeight,w,h);
        ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,w,h);
      }
    }
    return {draw};
  }
  function advanceStars(stars,dt,boost=false){
    for(const star of stars){star.z-=dt*(boost?42:18);if(star.z<1)star.z+=120;}
  }
  function projectStar(star,w,h){
    const scale=Math.min(w,h)*.9/star.z;
    return {x:w*.5+star.x*scale,y:h*.34+star.y*scale,r:Math.min(2.3,.25+scale*.05)};
  }
  window.StarfallSpace=Object.freeze({create,canvasSky,advanceStars,projectStar,sector,SKIES,coverRect,vertex,fragment,planetFragment});
})();
