import { glslNoise } from '../helperClasses/shaderUtils.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { phonemeImageDict } from './mouthAnimator.js';
import { eyesImagelist } from './blinkAnimator.js';

export function getHeadMaterial(faceTexture){
    var headVertex  = `
        varying vec4 vPos;
        varying vec4 testPos;
        uniform mat4 camProj;
        uniform mat4 viewMat;
        uniform mat4 model;
        varying vec2 vUv;


        #include <skinning_pars_vertex>
        void main() {
            // projectionMatrix

            
            #include <skinbase_vertex>
            #include <begin_vertex>
            #include <skinning_vertex>
            #include <project_vertex>

            // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            // testPos = camProj * model * vec4( position, 1.0 );
            vUv = uv;
            vPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
    `;
    var headFragment = glslNoise()+ `
        varying vec4 vPos;
        varying vec4 testPos;
        uniform sampler2D eyeTex;
        uniform sampler2D mouthTex;
        uniform sampler2D headTex;
        uniform float headLerpTime;

        uniform sampler2D underTex;

        varying vec2 vUv;

        void main() {
            
            vec4 eyeMaskCol = texture2D(eyeTex, vUv); 
            vec4 mouthMaskCol = texture2D(mouthTex, vUv); 
            vec4 underCol = texture2D(underTex, (vUv - 0.5f) * 0.7f + 0.5f); 
            vec4 headCol = texture2D(headTex, vUv*vec2(0.5f,0.5f)-vec2(0.25f,0.25f)); 
            vec4 glowPart = eyeMaskCol+mouthMaskCol;

            if(glowPart.w > 0.01f){
                gl_FragColor = vec4(0,1,0,1);
            } else {
                gl_FragColor = vec4(0.5f*headCol.xyz,1.f);
            }

            if(vUv.x < 0.5f+0.1f*snoise(vec4(vUv*10.f,1.f,1.f)) || vUv.y > 0.5+0.1f*snoise(vec4(vUv*10.f,1.f,1.f))){
                float noiseVal = snoise(vec4(vUv*10.f,1.f,1.f))*0.5f+0.5f;
                float timeValue = headLerpTime;

                if (noiseVal > timeValue && noiseVal < timeValue+0.1f){
                    gl_FragColor = vec4(0.f,1.f,0,1.f); 
                } else if (noiseVal > timeValue){
                    gl_FragColor = underCol;
                }  
            } 
            
            //gl_FragColor = glowPart;
        
        }
        `;
    var texLoader = new THREE.TextureLoader();
    return new THREE.ShaderMaterial( {
        
    

        uniforms: {
            eyeTex: {value: eyesImagelist[0]},
            mouthTex: {value: phonemeImageDict["X"]},
            headTex: {value: texLoader.load("Assets/Models/chatbot/oscillascope.jpg")},
            underTex: {value: texLoader.load("Assets/Models/chatbot/dentalPhantom.jpg")},
            headLerpTime: {value: 1}

        },
    
        // Declare Vertex and Fragment Shader
        vertexShader: headVertex,
        fragmentShader: headFragment,
        //side: THREE.DoubleSide,
        transparent: false,
        uniformsNeedUpdate: true,
        light: true,
        skinning: true,
        
    
    } );
}

export function getSynthMaterial(){
    var synthVertex  = `
        varying vec4 vPos;
        varying vec4 testPos;
        uniform mat4 camProj;
        uniform mat4 viewMat;
        uniform mat4 model;
        varying vec2 vUv;


        #include <skinning_pars_vertex>
        void main() {
            // projectionMatrix

            
            #include <skinbase_vertex>
            #include <begin_vertex>
            #include <skinning_vertex>
            #include <project_vertex>

            // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            // testPos = camProj * model * vec4( position, 1.0 );
            vUv = uv;
            vPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        }
    `;

        var synthFragment = `
            varying vec4 vPos;
            varying vec4 testPos;
            uniform sampler2D synthTex;
            varying vec2 vUv;

            float rand(vec2 co)
            {
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }
    
    
    
            void main() {
                
                vec4 synthCol = texture2D(synthTex, vUv); 
                gl_FragColor = vec4(0.5f*synthCol.xyz, 1.f);


                if(synthCol.x > 0.6f && synthCol.z > 0.5f){
                
                    gl_FragColor = vec4(0,rand(vUv),0,1.f);
                }
    
    
            }
            `;
        var texLoader = new THREE.TextureLoader();
    
    
        var synthTex = texLoader.load("./Assets/Models/chatbot/moogsynth.jpg");
    
        return new THREE.ShaderMaterial( {
            
            
    
            uniforms: {
                synthTex: {value: synthTex}
            },
        
            // Declare Vertex and Fragment Shader
            vertexShader: synthVertex,
            fragmentShader: synthFragment,
            //side: THREE.DoubleSide,
            transparent: false,
            uniformsNeedUpdate: true,
            skinning: true
            
        
        } );
}

