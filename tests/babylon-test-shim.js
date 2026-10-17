/* Browser smoke-test shim only. NOT a 3D engine; not shipped with the game. */
(function () {
  class Vec3 {
    constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
    set(x,y,z){this.x=x;this.y=y;this.z=z;}
    setAll(v){this.x=this.y=this.z=v;}
    static Lerp(a,b,t){return new Vec3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);}
  }
  class Color3 {constructor(r=0,g=0,b=0){this.r=r;this.g=g;this.b=b;}static FromHexString(hex){return new Color3(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);}}
  class Color4 {constructor(r=0,g=0,b=0,a=1){Object.assign(this,{r,g,b,a});}}
  class Node {
    constructor(name='node'){this.name=name;this.position=new Vec3();this.rotation=new Vec3();this.scaling=new Vec3(1,1,1);this.parent=null;this.isPickable=true;this.enabled=true;}
    setEnabled(value){this.enabled=value;}
    getChildMeshes(){return [];}
    dispose(){this.disposed=true;}
  }
  class Engine {
    constructor(canvas){this.canvas=canvas;this.level=1;this.interval=null;}
    setHardwareScalingLevel(level){this.level=level;}
    getHardwareScalingLevel(){return this.level;}
    getFps(){return 55;}
    getDeltaTime(){return 32;}
    resize(){}
    runRenderLoop(callback){this.interval=setInterval(callback,32);}
    stopRenderLoop(){clearInterval(this.interval);}
    dispose(){this.stopRenderLoop();}
  }
  class Scene {
    static FOGMODE_EXP2=2;
    constructor(){this.onDisposeObservable={add(){}};this.imageProcessingConfiguration={};}
    render(){}
  }
  const MeshBuilder = new Proxy({}, {get(target, key){return (name)=>new Node(name);}});
  class Mat {constructor(name){this.name=name;this.diffuseColor=null;this.emissiveColor=null;}}
  class Light {constructor(name){this.name=name;}}
  class Camera extends Node{setTarget(target){this.target=target;}}
  window.__skyAnimationTest = {files:[],starts:[]};
  window.BABYLON={Engine,Scene,Color3,Color4,Vector3:Vec3,TransformNode:Node,MeshBuilder,StandardMaterial:Mat,HemisphericLight:Light,DirectionalLight:Light,FreeCamera:Camera,
    SceneLoader:{ImportMeshAsync:async(_,root,file)=>{
      window.__skyAnimationTest.files.push(file);
      return {
        meshes:[new Node('GLB imported root'),new Node('model child')],
        animationGroups:file?.includes('Rigged') ? ['Idle','Walk','Run','Jump','Glide','Land','Blast','Hit','Victory'].map(name=>({name,played:0,start(){this.played++;this.active=true;window.__skyAnimationTest.starts.push(name);},stop(){this.active=false;},pause(){this.active=false;},play(){this.active=true;}})):[],
      };
    }}};
})();
