/** Mobile-aware Solar Sanctuary ambience and final Relic Master VFX.
 * All geometry is constructed once; no full-screen post-processing on phones.
 */
export const SOLAR_VFX_BUDGET = Object.freeze({
  mobile: Object.freeze({motes:10, sparks:4}),
  desktop: Object.freeze({motes:20, sparks:6}),
});
export function relicMasterPose({time=0,mode='idle',attack=null,phase=1,reducedMotion=false}={}) {
  const t=Number.isFinite(time)?time:0;
  const windup=mode==='windup';
  const leftZ=windup?(attack==='wave'?-.95:attack==='sigil'?-1.05:-.64):(-.16+(reducedMotion?0:Math.sin(t)*.09));
  const rightZ=windup?(attack==='wave'?.95:attack==='sigil'?1.05:.64):(.16+(reducedMotion?0:Math.sin(t*1.2)*.09));
  return {leftZ,rightZ,bob:reducedMotion?0:Math.sin(t*1.75)*.065,
    ringSpin:reducedMotion?0:(windup?.65:.22)*Math.min(1.7,1+phase*.16),
    auraScale:windup?1.14:1+(reducedMotion?0:Math.sin(t*2.4)*.045),
    orbRadius:windup?2.2:1.7,
    armX:windup?(attack==='wave'?.48:-.25):0,
  };
}
export function createSolarVisuals(B,scene,{islands,guardianArt,portalNode,mobile=true,reducedMotion=false}){
  const budget=SOLAR_VFX_BUDGET[mobile?'mobile':'desktop'];
  const mat=(name,diffuse,emissive,alpha=1)=>{
    const m=new B.StandardMaterial(name,scene);
    m.diffuseColor=B.Color3.FromHexString(diffuse);
    m.emissiveColor=B.Color3.FromHexString(emissive);
    m.alpha=alpha;m.backFaceCulling=false;return m;
  };
  const moteMat=mat('Solar charge motes','#ffe8ac','#b68a28',.72);
  const arcMat=mat('Solar crystal arcs','#ffd681','#b68436',.82);
  const gateMat=mat('Solar Sanctuary crown-gate aura','#f5eabc','#ac852c',.62);
  const motes=[];const fragments=[];const rings=[];let ready=false;
  for(let i=0;i<budget.motes;i++){
    const island=islands[i%islands.length];const a=i*2.39;
    const r=1.8+(i%5)*.55;
    const m=B.MeshBuilder.CreatePolyhedron(`Solar ambient mote ${i}`,{type:1,size:.10+(i%2)*.05},scene);
    m.position.set(island.x+Math.cos(a)*r,island.h+1.8+(i%6)*.45,-(island.y+Math.sin(a)*r));
    m.isPickable=false;m.material=moteMat;
    motes.push({mesh:m,height:m.position.y,phase:i*1.64});
  }
  if(guardianArt?.root){
    for(let i=0;i<budget.sparks;i++){
      const spark=B.MeshBuilder.CreatePolyhedron(`Relic Master orbit spark ${i}`,{type:1,size:.21+(i%2)*.06},scene);
      spark.parent=guardianArt.root;spark.material=arcMat;spark.isPickable=false;
      fragments.push(spark);
    }
  }
  for(let i=0;i<2;i++){
    const ring=B.MeshBuilder.CreateTorus(`Solar exit halo ${i}`,{
      diameter:3.65+i*.42,thickness:.042,tessellation:28},scene);
    ring.parent=portalNode;ring.rotation.x=Math.PI/2;ring.position.z=-.18-i*.11;
    ring.material=gateMat;ring.isPickable=false;rings.push(ring);
  }
  let bloom=null;
  if(!mobile && !reducedMotion && B.GlowLayer){
    try {bloom=new B.GlowLayer('Solar subtle desktop bloom',scene,{mainTextureRatio:.18,blurKernelSize:14});bloom.intensity=.2;}
    catch{bloom=null;}
  }
  const gate=B.Color3.FromHexString('#fcd88b');
  function setPortalReady(flag){ready=!!flag;}
  function updateAmbient(dt,time){
    if(!reducedMotion){
      for(const v of motes)v.mesh.position.y=v.height+Math.sin(time*.6+v.phase)*.17;
      rings.forEach((r,i)=>{r.rotation.z+=dt*(i?.12:-.15);});
    }
    const strength=(ready?.74:.30)+(reducedMotion?0:Math.sin(time*.9)*.05);
    gateMat.emissiveColor.r=gate.r*strength;
    gateMat.emissiveColor.g=gate.g*strength;
    gateMat.emissiveColor.b=gate.b*strength;
    if(bloom)bloom.intensity=strength*.25;
  }
  function updateGuardian(dt,time,guardian,art){
    if(!art?.root||!guardian?.active)return;
    const p=relicMasterPose({time,mode:guardian.mode,attack:guardian.pendingAttack,phase:guardian.phase,reducedMotion});
    art.root.position.y=art.ground+p.bob;
    art.root.attackArmLeft.rotation.z=p.leftZ;
    art.root.attackArmRight.rotation.z=p.rightZ;
    art.root.attackArmLeft.rotation.x=p.armX;
    art.root.attackArmRight.rotation.x=p.armX;
    art.halo.rotation.z+=dt*p.ringSpin;
    art.halo.scaling.setAll(p.auraScale);
    art.floatingShards.forEach((s,i)=>{
      const angle=time*.75+i*Math.PI*.5;
      s.position.set(Math.cos(angle)*p.orbRadius,3.55+Math.sin(angle*.9)*.21,Math.sin(angle)*1.5);
      s.rotation.y+=dt*.45;
    });
    fragments.forEach((s,i)=>{
      const angle=time*.8+i*Math.PI*2/fragments.length;
      s.position.set(Math.cos(angle)*(p.orbRadius+.3),3.25+Math.sin(time+i)*.33,Math.sin(angle)*(p.orbRadius+.3));
      s.rotation.y+=dt*.5;
    });
    if(art.hitFlash>0){art.hitFlash=Math.max(0,art.hitFlash-dt);}
    if(guardian.mode!=='windup' && art.hitFlash<=0){
      art.crystal.emissiveColor=B.Color3.FromHexString('#b58450');
    }
  }
  function dispose(){
    for(const x of motes)x.mesh.dispose();
    for(const x of fragments)x.dispose();
    for(const x of rings)x.dispose();
    try{bloom?.dispose();}catch{}
  }
  return {setPortalReady,updateAmbient,updateGuardian,dispose};
}
