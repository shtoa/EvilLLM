import { scene } from "../core/initScene.js";
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/tween.module.min.js';
import { ModifyFogShader } from "./fog.js";
import { UpdateManager } from "../managers/UpdateManager.js";

var videoTexture;
var rgbTex;
var upperJawTex;
var lowerJawTex;

var tvMaterial;

async function instantiateShaderTV(){
var tvVertex  = `
        varying vec4 vPos;
        varying vec4 testPos;
        uniform mat4 camProj;
        uniform mat4 viewMat;
        uniform mat4 model;
        varying vec2 vUv;


        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
            vPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
    `;
    // https://babylonjs.medium.com/retro-crt-shader-a-post-processing-effect-study-1cb3f783afbc
    var tvFragment = `
        //varying vec4 vPos;
        //varying vec4 testPos;
        //uniform sampler2D videoTex;
        //uniform sampler2D rgbTex;
        //#define M_PI 3.1415926535897932384626433832795


        //varying vec2 vUv;

        //  vec4 scanLineIntensity(float uv, float resolution, float opacity)
        // {
        //     float intensity = sin(uv * resolution *  M_PI  * 2.0);
        //     intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
        //     return vec4(vec3(pow(intensity, opacity)), 1.0);
        // }
 




       // void main() {
            
        

        // add noise to video
        // A seed for the random number generation
        vec2 videoUv = vUv;

        vec2 seed = vec2(scrollTime, videoUv.y);
        
        // Add the texture, but with an x-based offset to provide some CRT-style effect
        videoUv.x += randInRange(vec2(-0.05, 0.05), seed);

        vec4 videoCol = texture2D(videoTex, vUv); 

        vec4 rgbCol = texture2D(rgbTex, (vUv-0.5f)*500.f+0.5f); 

        //vec4 upperJawCol = texture2D(upperJawTex, (vUv-0.5f)*1.5f+0.5f+vec2(0,0.5f*floor(sin(scrollTime))+0.5f)); 
        //vec4 lowerJawCol = texture2D(lowerJawTex, (vUv-0.5f)*1.5f+0.5f); 


        float d = length(vUv - 0.5);
        float vig = (1.5f - pow(d,0.5));

        // scan lines
        float M_PI = 3.1415926535897932384626433832795;
        vec2 resolution = vec2(40.f,40.f);
        float opacity = 0.5f;
        float intensity = sin(vUv.x * resolution.x *  M_PI  * 2.0);
        intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
        vec4 lineIntensityX = vec4(vec3(pow(intensity, opacity)), 1.0);

        intensity = sin(vUv.y * resolution.y *  M_PI  * 2.0 + scrollTime*50.f);
        intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;

        vec4 lineIntensityY = vec4(vec3(pow(intensity, opacity)), 1.0);


        // flickering
        // float flicker = 1.0;
        
        // if(sin(scrollTime) > -0.05 && sin(scrollTime) < 0.05){
        //     flicker = smoothstep(-1.f,1.f,sin(fract(scrollTime * 100.f + vWorldPosition.x*vWorldPosition.y)));
        // } 


       // #ifdef USE_EMISSIVEMAP

           vec4 emissiveColor = vec4(videoCol.x, videoCol.y, videoCol.z, 1.f);

           
            // if(lowerJawCol.w != 0.f){
            //     //emissiveColor = lowerJawCol;
            // }
            
            

            // if(upperJawCol.w != 0.0f){
            //     emissiveColor = upperJawCol;
            // }
        

           emissiveColor *= lineIntensityX;
           emissiveColor *= lineIntensityY;

        #ifdef DECODE_VIDEO_TEXTURE_EMISSIVE

            // use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

            emissiveColor = sRGBTransferEOTF( emissiveColor );

        #endif

            totalEmissiveRadiance *= emissiveColor.rgb *vig * 4.5f ; // * 4.5f

     //   #endif

        

          
        diffuseColor = vec4(videoCol.x*rgbCol.x*vig, videoCol.y*rgbCol.y*vig, videoCol.z*rgbCol.z*vig, 1.f);
        
        diffuseColor *= lineIntensityX;
        diffuseColor *= lineIntensityY;


        // if(lowerJawCol.x > 0.9f){
        //     diffuseColor = upperJawCol;
        // }
        
        

        // if(upperJawCol.x > 0.9f){
        //     diffuseColor = upperJawCol;
        // }
        

        //diffuseColor = vec4(vUv.x, vUv.y, 1.f,1.f);


        //gl_FragColor = vec4(videoCol.x, videoCol.y, videoCol.z, 1.f);
        
        //vec4 baseCol = videoCol;
        //vec2 scanLineOpacity = vec2(0.5f,0.5f);
        //baseCol *= scanLineIntensity(vUv.x, 100.f, scanLineOpacity.x);
        //baseCol *= scanLineIntensity(vUv.y, 100.f, scanLineOpacity.y);

        //gl_FragColor = vec4(baseCol.xyz,1f);


       // }
        `;
    var texLoader = new THREE.TextureLoader();

    const video = document.getElementById( 'video' );

    videoTexture = new THREE.VideoTexture( video );
    videoTexture.encoding = THREE.sRGBEncoding;
    // videoTexture.minFilter = THREE.NearestFilter;
    // videoTexture.magFilter = THREE.NearestFilter

     rgbTex = texLoader.load("./Assets/Models/chatbot/rgbImage.png");
     rgbTex.wrapS = THREE.RepeatWrapping;
     rgbTex.wrapT = THREE.RepeatWrapping;

     
    lowerJawTex = texLoader.load("./Assets/Models/chatbot/lowerJaw.png");
    upperJawTex = texLoader.load("./Assets/Models/chatbot/upperJaw.png");

    lowerJawTex.minFilter = THREE.LinearFilter;
    lowerJawTex.linearFilter = THREE.LinearFilter;
    lowerJawTex.magFilter = THREE.LinearFilter;

    upperJawTex.minFilter = THREE.LinearFilter;
    upperJawTex.linearFilter = THREE.LinearFilter;
    upperJawTex.magFilter = THREE.LinearFilter;

    rgbTex.generateMipmaps = false;

    rgbTex.minFilter = THREE.LinearFilter;
    rgbTex.linearFilter = THREE.LinearFilter;
    rgbTex.magFilter = THREE.LinearFilter;


    var material = new THREE.MeshPhongMaterial( {


        onBeforeCompile: (shader)=>{
            material.userData.shader = shader;
 
            //console.log(shader.fragmentShader)
            shader.uniforms.videoTex= {
                videoTex: {value: videoTexture}},
            shader.uniforms.rgbTex = {
                rgbTex: {value: rgbTex}
            },

            shader.uniforms.lowerJawTex = {
                lowerJawTex: {value: lowerJawTex}
            },

              shader.uniforms.upperJawTex = {
                upperJawTex: {value: upperJawTex}
            },
            shader.uniforms.scrollTime = {value: 0},

            updateUniformsTV(material)
        
            // // Declare Vertex and Fragment Shader
            shader.vertexShader = shader.vertexShader.replace(`#include <uv_pars_vertex>`,`
                    #include <uv_pars_vertex>
                    varying vec2 vUv;
                
                `),


                shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`,`
                    #include <uv_vertex>
                    vUv = uv;
                
                `)
            shader.fragmentShader = shader.fragmentShader.replace(`#include <emissivemap_pars_fragment>`,
            `#include <emissivemap_pars_fragment>
            
                uniform sampler2D videoTex;
                uniform sampler2D rgbTex;

                uniform sampler2D upperJawTex;
                uniform sampler2D lowerJawTex;

                uniform float scrollTime;
                varying vec2 vUv;
                // #define M_PI 3.1415926535897932384626433832795

                float randFloat(vec2 co){
                    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
                }

                float randInRange(vec2 range, vec2 seed) {
                    float randBetweenZeroAndOne = (randFloat(seed) + 1.) / 2.;
                    
                    return range.x + randBetweenZeroAndOne * (range.y - range.x);
                }
            
            
            `),


            shader.fragmentShader = shader.fragmentShader.replace(`#include <emissivemap_fragment>`,
            `#include <emissivemap_fragment>`+tvFragment),
            shader.uniformsNeedUpdate = true
        },

        emissive: 0x49ad5, //49ad5 // 55cf5e
        specular: 0xFFFFFF,
        transparent: true,
    

    
    });

    return material;



}

export async function initTVs(){
    var tvs = await loadTVs();
    scene.add(tvs);
}

async function loadTVs(){
     var fLoader = new FBXLoader();

        var tvs = await fLoader.loadAsync("../assets/models/chatbot/tvs.fbx");
        tvMaterial = await instantiateShaderTV();
        

        tvs.position.copy(new THREE.Vector3(0,-1,0));
        tvs.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(0.005));
        tvs.rotateY(-Math.PI/2);


        scene.add(tvs);

        tvs.traverse((obj)=>{
            if(obj.isMesh === true){

                var i = 0;
                for(var material of obj.material){

                    obj.material[i].onBeforeCompile = ModifyFogShader;
                  
                    if(material.name == "TvInner"){
                        // set to camera view
                        obj.material[i] = tvMaterial;
                        material.needsUpdate = true;
                    } else {

                        
                        var texLoader = new THREE.TextureLoader();
                        var tvTexture = texLoader.load("../assets/models/chatbot/mac.jpg");
                        obj.material[i] = new THREE.MeshPhongMaterial({map: tvTexture});
                        material.needsUpdate = true;
                    }
                    i += 1;
                }
            }
        })

        return tvs;
}

function updateUniformsTV(material){
    material.userData.shader.uniforms.rgbTex.value = rgbTex;
    material.userData.shader.uniforms.rgbTex.needsUpdate = true;

    material.userData.shader.uniforms.videoTex.value = videoTexture;
    material.userData.shader.uniforms.videoTex.needsUpdate = true;


    material.userData.shader.uniforms.lowerJawTex.value = lowerJawTex;
    material.userData.shader.uniforms.lowerJawTex.needsUpdate = true;

    material.userData.shader.uniforms.upperJawTex.value = upperJawTex;
    material.userData.shader.uniforms.upperJawTex.needsUpdate = true;


    material.userData.shader.uniforms.scrollTime.value = scene.userData.globalTime;
    material.userData.shader.uniforms.scrollTime.needsUpdate = true;
}

// UpdateManager.add(()=>{
//     if(tvMaterial && tvMaterial.userData > 0){

//         if(tvMaterial.userData.shader){
//             updateUniformsTV();
//         }
//     }
// })