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

export class ChatbotCharacter{

    constructor(){

        this.insanityLevel = {value: 0};
        this.character = null; // prepare for the mesh of the character to be loaded

        this.loadBotFBX();

    }

    // start tween to lerp the insanity level 

    initInsanityLerp(target){

        this.insanityLerpTween = new TWEEN.Tween(this.insanityLevel).to({value: target}, 5000).easing(TWEEN.Easing.Cubic.InOut);
        this.insanityLerpTween.start();

    }

    async loadBotFBX(){

        // load character model FBX
        var fLoader = new FBXLoader();
        this.character = await fLoader.loadAsync("../../assets/models/chatbot/character2.fbx");

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

        this.headBone = this.character.getObjectByName("mixamorigHead")

        // update synth material to be animated 
        this.synthMaterial = await getSynthMaterial();
        this.character.traverse((obj)=>{

            if(obj.isMesh === true){
                obj.material.onBeforeCompile = ModifyFogShader;
                var i = 0;
                for(var material of obj.material){
                 
                    if(material.name == "Material.003"){
                        obj.material[i] = this.synthMaterial; // change this to synth material
                    }
                    
                    i+=1;
                }
            }


        })

        // lerp insanity level with each prompt
        socket.on('hasFinishedProcessing',(hasFinishedProcessing, results) => {

            if(hasFinishedProcessing) {

                // become more insane with each prompt
                this.initInsanityLerp(this.insanityLevel.value<0.3 ? Math.max(this.insanityLevel.value+Math.random()*0.3,0) : 1); 
                speakVoiceLine(results.ttsResult, this.insanityLevel.value);

            } else playThinkingSound();
            

        })

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

        this.headBone.lookAt(scene.userData.mainCamera.position);
    
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
