/* Original GLBs augment the existing Babylon scene. Solid geometry remains usable if a download fails. */
(() => {
  'use strict';
  const FILES={player:'pathfinder.glb',scout:'red_scout.glb',darter:'red_scout.glb',turret:'siege_fighter.glb',heavy:'siege_fighter.glb',shield:'warden_drone.glb',boss:'sovereign_citadel.glb',rock:'lava_asteroid.glb',ice:'cryo_shard.glb',relay:'command_relay.glb',ark:'dawn_ark.glb',ring:'orbital_ring.glb',pod:'escape_pod.glb'};
  function create(B,scene,quality,onStatus=()=>{}){
    const containers=new Map(),pending=new Map(),roots=new Set(),decor=[];let disposed=false,generation=0;
    const key=new B.DirectionalLight('Starfall key light',new B.Vector3(-.4,-.8,.6),scene);key.diffuse=B.Color3.FromHexString('#e3edff');key.intensity=1.65;
    const rim=new B.DirectionalLight('Starfall blue rim',new B.Vector3(.6,.3,-1),scene);rim.diffuse=B.Color3.FromHexString('#75bfff');rim.intensity=.8;
    let glow=null;if(!quality.compact&&B.GlowLayer){glow=new B.GlowLayer('Starfall reactor glow',scene,{mainTextureFixedSize:512,blurKernelSize:24});glow.intensity=.38;}
    async function load(kind){
      const file=FILES[kind];if(!file||disposed)return null;
      if(containers.has(file))return containers.get(file);if(pending.has(file))return pending.get(file);
      const request=B.SceneLoader.LoadAssetContainerAsync('assets/models/starfall/',file+'?v=4.1',scene,undefined,'.glb').then(c=>{
        if(disposed||scene.isDisposed){c.dispose();return null;}containers.set(file,c);onStatus(file,true);return c;
      }).catch(()=>{onStatus(file,false);return null;}).finally(()=>pending.delete(file));pending.set(file,request);return request;
    }
    async function attach(root,kind,scale=1){
      if(!root||disposed)return false;
      const fallback=root.getChildMeshes().filter(m=>!['playerShieldRing','shieldEnemyRing'].includes(m.name));
      roots.add(root);root.onDisposeObservable.add(()=>roots.delete(root));
      const container=await load(kind);
      if(!container||disposed||root.isDisposed())return false;
      const entry=container.instantiateModelsToScene(name=>'StarfallGLB_'+name,false,{doNotInstantiate:false});
      for(const node of entry.rootNodes){node.parent=root;node.scaling.scaleInPlace(scale);node.getChildMeshes().forEach(mesh=>{mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=false;});}
      fallback.forEach(mesh=>mesh.setEnabled(false));root.metadata={...(root.metadata||{}),starfallGLB:kind};
      return true;
    }
    function clearDecor(){while(decor.length)decor.pop().dispose();}
    async function theme(index){
      const token=++generation;clearDecor();
      const kind=[3,7,10,11,17].includes(index)?'boss':'ring';const asset=await load(kind);
      if(!asset||disposed||token!==generation)return;
      const root=new B.TransformNode('Distant sector landmark',scene);root.position.set(index%2?22:-20,7,155);root.rotation.y=Math.PI;root.scaling.setAll(kind==='boss'?3.8:2.4);decor.push(root);void attach(root,kind);
      const rock=await load(index%4===0?'ice':'rock');if(!rock||disposed||token!==generation)return;
      for(let i=0;i<(quality.compact?6:12);i++){
        const r=new B.TransformNode('Asteroid horizon',scene);r.position.set((i%2?1:-1)*(15+(i%4)*4),-7+(i%5)*4,32+i*13);r.scaling.setAll(1.8+(i%3)*.8);decor.push(r);void attach(r,index%4===0?'ice':'rock');
      }
    }
    function update(dt,state){
      if(state.status!=='playing')return;
      decor.forEach(root=>{if(root.name==='Asteroid horizon'){root.position.z-=dt*(state.input.boost?22:11);root.rotation.y+=dt*.09;if(root.position.z<-12)root.position.z+=190;}});
    }
    function dispose(){if(disposed)return;disposed=true;++generation;clearDecor();glow?.dispose();containers.forEach(c=>c.dispose());containers.clear();key.dispose();rim.dispose();roots.clear();}
    scene.onDisposeObservable.add(dispose);
    return {attach,theme,update,dispose,containers,pending,roots,quality,load};
  }
  window.Starfall3D=Object.freeze({create,FILES});
})();
