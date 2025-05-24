import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { scene } from '../core/initScene.js';
import { ModifyFogShader } from '../decoration/fog.js';
//import { excludeBones, includeBones } from '../../Scripts/helperClasses/boneHelpers.js';
import { TWEEN } from 'https://unpkg.com/three@0.128.0/examples/jsm/libs/tween.module.min.js';
import { socket } from '../socket.js';

import { getEyeTexture } from './blinkAnimator.js';
import { getHeadMaterial, getSynthMaterial } from './chatbotShaders.js';
import { getMouthTexture } from './mouthAnimator.js';
import { playThinkingSound, speakVoiceLine } from './chatbotVoice.js';
import { camera } from '../core/initScene.js';

function randomPointInTriangle(a, b, c) {
  const r1 = Math.random();
  const r2 = Math.random();
  const sqrtR1 = Math.sqrt(r1);

  const v1 = a.clone().multiplyScalar(1 - sqrtR1);
  const v2 = b.clone().multiplyScalar(sqrtR1 * (1 - r2));
  const v3 = c.clone().multiplyScalar(sqrtR1 * r2);

  return v1.add(v2).add(v3);
}

// https://github.com/mrdoob/three.js/issues/17720

export class ChatbotCharacter{

    constructor(){

        this.insanityLevel = {value: 0};
        this.isInsanityReset = false;
        this.character = null; // prepare for the mesh of the character to be loaded
        this.insanityLerpTween = new TWEEN.Tween(this.insanityLevel).to({value: 0}, 0).easing(TWEEN.Easing.Cubic.InOut);
        this.loadBotFBX();

    }

    // start tween to lerp the insanity level 

    initInsanityLerp(target, time = 5000){

        this.insanityLerpTween = new TWEEN.Tween(this.insanityLevel).to({value: target}, time).easing(TWEEN.Easing.Cubic.InOut);
        this.insanityLerpTween.start();

    }

    async loadBotFBX(){

        // load character model FBX
        var fLoader = new FBXLoader();
        this.character = await fLoader.loadAsync("../../assets/models/chatbot/chatbot3.fbx");

        // play idle animation for charcter 
        this.animationsMap = new Object(); 

        this.botMixer = new THREE.AnimationMixer( this.character );
        this.animationsMap["idle"] = this.botMixer.clipAction(this.character.animations[0]);
        this.animationsMap["idle"].loop = THREE.LoopRepeat;
        this.animationsMap["idle"].play();

        // position character in center facing the camera
        this.character.position.copy(new THREE.Vector3(0,-1,0));
        this.character.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(0.005));
        this.character.rotateY(-Math.PI/2);

        
        // change head material to be animated 
        this.headMaterial = getHeadMaterial();
        this.character.getObjectByName("head").material[6] = this.headMaterial; 
        this.character.getObjectByName("head").frustumCulled = false;

        this.particleHead = this.character.getObjectByName("particleHead");
        this.particleHead.visible = false;

        // for (let i = 0; i < positionAttr.count; i++) {
        //     const pos = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
        //     pos.add(new THREE.Vector3(3.35,0.1,-6.65));
        //     pos.multiplyScalar(88.82561492919923);
        //     //pos.sub(this.particleHead.position);
        //     pointList.push(pos);
        // }

        // this.sphere;
        // for(var pointPos of pointList){
        //     const geometry = new THREE.SphereGeometry(0.01, 8, 8);
        //     const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
        //     const sphere = new THREE.Mesh( geometry, material ); 
        //     sphere.position.copy(pointPos);

        //     //scene.add(sphere)
        //     this.sphere = sphere;
        // }


        // const buffer = new THREE.BufferGeometry().setFromPoints(pointList);
        // const material = new THREE.PointsMaterial({ color: 0xff00ff, size: 0.1 });
        // const points = new THREE.Points(buffer, material);

        // points.frustumCulled = false;

        // points.visible =true;
        // this.points = points;

        // scene.add(points);

        this.headBone = this.character.getObjectByName("mixamorigHead");
        // this.headBone.add(points);

        // update synth material to be animated 
        this.synthMaterial = await getSynthMaterial();
        this.character.traverse((obj)=>{

            if(obj.isMesh === true){
                obj.material.onBeforeCompile = ModifyFogShader;
                var i = 0;
                if(obj.material.length > 1){
                    for(var material of obj.material){
                    
                        if(material.name == "Material.003"){
                            obj.material[i] = this.synthMaterial; // change this to synth material
                        }
                        
                        i+=1;
                    }
                }
            }


        })

        // lerp insanity level with each prompt
        socket.on('hasFinishedProcessing',(hasFinishedProcessing, results) => {

            if(hasFinishedProcessing) {

                // become more insane with each prompt
                console.log("insanityLevel: " + this.insanityLevel.value);
             
                speakVoiceLine(results.ttsResult, this.insanityLevel.value);

            } else playThinkingSound();
            

        })
        // set new insanity value
        socket.on('insanityUpdate', (insanityLevel) => {this.initInsanityLerp(insanityLevel.value)});

        scene.add(this.character);

    }

    updateEyeTexture(){
        
        this.headMaterial.uniforms.eyeTex.value = getEyeTexture(); 
        this.headMaterial.uniforms.eyeTex.needsUpdate = true;
    }

    updateMouthTexture(){

        this.headMaterial.uniforms.mouthTex.value = getMouthTexture().normal;
        this.headMaterial.uniforms.mouthTex.needsUpdate = true;

        this.headMaterial.uniforms.underTex.value = getMouthTexture().phantom;
        this.headMaterial.uniforms.underTex.needsUpdate = true;
    }

    updateHeadTexture(){

        this.headMaterial.uniforms.headLerpTime.value = 1-this.insanityLevel.value;
        this.headMaterial.uniforms.headLerpTime.needsUpdate = true;
    
    }
    
    headLookAtCamera(){

        if (!this.headBone || !scene.userData.mainCamera) return;
        //this.headBone.lookAt(scene.userData.mainCamera.position);
    
    }

    update(){
        
        if(this.character){

            TWEEN.update(); // TO DO: move to seperate global function

            // check if animationMixer is initialized
            if(this.botMixer != null){

                this.botMixer.update(scene.userData.globalDelta);

                // follow the camera with the head
                
                this.headLookAtCamera();

                // update the uniforms on the textures
                this.updateEyeTexture();
                this.updateMouthTexture();
                this.updateHeadTexture();
        
            }
        }

    }

}
