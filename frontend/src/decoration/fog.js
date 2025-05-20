import { scene } from "../core/initScene.js";
import { glslNoise } from "../helperClasses/shaderUtils.js";
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { UpdateManager } from "../managers/UpdateManager.js";
import { socket } from "../socket.js";
import { TWEEN } from 'https://unpkg.com/three@0.128.0/examples/jsm/libs/tween.module.min.js';

var shaders = [];
var fogLerpTween;

export const ModifyFogShader = (s)=>{
    shaders.push(s);
    s.uniforms.fogTime = {value : 0}
}

export function initFog(){
    // Start the animation Loop
    scene.fog = new THREE.FogExp2(0x39FF14, 0.0015);
    initializeFogShader();
}

function initializeFogShader()
{
    THREE.ShaderChunk.fog_fragment = `
      #ifdef USE_FOG
        vec3 fogOrigin = cameraPosition;
        vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
        float fogDepth = distance(vWorldPosition, fogOrigin);
  
        fogDepth *= fogDepth;

        // custom worley
        float simplexNoise = (snoise(vec4(vWorldPosition*0.01f,fogTime/10.f))*0.5f+0.5f);
        fogDepth *= simplexNoise;

        float fogDensityFactor = 1.f;

        float heightFactor = 0.05;
        float fogFactor = heightFactor * exp(-fogOrigin.y * fogDensity) * (
            1.0 - exp(-fogDepth * fogDirection.y * fogDensity)) / fogDirection.y;
        fogFactor = saturate(fogFactor*fogDensityFactor);
  
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      #endif`;
      
      THREE.ShaderChunk.fog_pars_fragment = glslNoise()+`
      #ifdef USE_FOG
        uniform float fogTime;
        uniform vec3 fogColor;
        varying vec3 vWorldPosition;
        #ifdef FOG_EXP2
          uniform float fogDensity;
        #else
          uniform float fogNear;
          uniform float fogFar;
        #endif
      #endif`;
      
      THREE.ShaderChunk.fog_vertex = `
      #ifdef USE_FOG
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0 )).xyz;
      #endif`;
      
      THREE.ShaderChunk.fog_pars_vertex = `
      #ifdef USE_FOG
        varying vec3 vWorldPosition;
      #endif`;
}

function initLerpFogTween(target){
    fogLerpTween = new TWEEN.Tween(scene.fog).to({density: target}, 30000).easing(TWEEN.Easing.Cubic.InOut);
    
    if(!fogLerpTween._isPlaying){
        fogLerpTween.start();
    }
};

socket.on("hasFinishedProcessing", (hasFinishedProcessing,result) =>{
    if(hasFinishedProcessing) initLerpFogTween(scene.fog.density < 0.05 ? Math.max(scene.fog.density+Math.random()*0.01,0) : 0.25); 
});

UpdateManager.add(()=>{
    for(let s of shaders){
        s.uniforms.fogTime.value = scene.userData.globalTime/10;
    }
})
