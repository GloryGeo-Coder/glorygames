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
  const fragment = `precision highp float;
    varying vec3 vDirection;
    uniform vec3 nebulaHue;
    uniform float sector;
    ${noise}
    void main(){
      vec3 d=normalize(vDirection),p=d*3.6+vec3(sector*.31,1.7,-.4);
      float broad=fbm(p),wisps=fbm(p*2.8+vec3(broad*3.));
      float cloud=smoothstep(.34,.78,broad)*smoothstep(.27,.74,wisps);
      float filament=pow(max(0.,1.-abs(wisps-.52)*5.),4.)*cloud;
      vec3 blue=vec3(.035,.13,.27),violet=vec3(.18,.045,.23);
      vec3 gas=mix(blue,violet,smoothstep(.3,.65,fbm(p+6.)));
      gas=mix(gas,nebulaHue*.21,.26);
      vec3 color=vec3(.003,.006,.016)+gas*cloud*2.8+mix(vec3(.09,.16,.22),nebulaHue*.25,.3)*filament*.65;
      vec3 starCell=d*420.;vec3 cell=floor(starCell),q=fract(starCell)-.5;
      float star=exp(-dot(q,q)*190.)*step(.991,hash(cell));
      color+=mix(vec3(.56,.7,1.),vec3(1.,.83,.65),hash(cell+2.))*star*.8;
      gl_FragColor=vec4(color,1.);
    }`;
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
    // The four-octave sky is baked once by the asset tool, rather than recalculated per frame on phones.
    const material=new B.StandardMaterial('Continuous nebula',scene);
    material.disableLighting=true;material.diffuseColor=B.Color3.Black();material.specularColor=B.Color3.Black();
    material.emissiveColor=B.Color3.White();material.backFaceCulling=false;material.disableDepthWrite=true;sky.material=material;
    let texture=null,sector=-1;
    function theme(index){
      const next=index%6;if(next===sector)return;sector=next;
      const old=texture;texture=new B.Texture('assets/backgrounds/starfall-nebula-'+next+'-v41.jpg',scene,false,false);
      texture.wrapU=B.Texture.CLAMP_ADDRESSMODE;texture.wrapV=B.Texture.CLAMP_ADDRESSMODE;
      texture.anisotropicFilteringLevel=2;material.emissiveTexture=texture;old?.dispose();
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
    scene.onDisposeObservable.add(()=>texture?.dispose());
    return {sky,material,theme,planet};
  }

  // The compatibility sky is cached at viewport size, never tiled, blended with other posters or scrolled.
  function canvasSky(){
    let canvas=null,key='',imageKey=-1,image=null;
    function draw(ctx,w,h,index,hue){
      const sector=index%6;
      if(imageKey!==sector){image=new Image();image.decoding='async';image.src='assets/backgrounds/starfall-nebula-'+sector+'-v41.jpg';imageKey=sector;}
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
        const crop=Math.min(image.naturalWidth/w,image.naturalHeight/h);
        const sw=w*crop,sh=h*crop;
        ctx.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,0,0,w,h);
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
  window.StarfallSpace=Object.freeze({create,canvasSky,advanceStars,projectStar,vertex,fragment,planetFragment});
})();
