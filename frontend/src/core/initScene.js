import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { ChatbotCharacter } from "../chatbot/ChatbotCharacter.js";
import { ModifyFogShader } from "../decoration/fog.js";
import { initTVs } from '../decoration/tvs.js';
import { UpdateManager } from '../managers/UpdateManager.js';
import { faceHelper } from './faceHelperInstance.js';
import { socket } from '../socket.js';
import { renderer } from './initRenderPipeline.js';

export var scene, chatBot, camera;
export var DEBUG_MODE = false;
var orbitControls;
var texLoader = new THREE.TextureLoader();

export function initScene(){
    
    scene = new THREE.Scene();

    chatBot = new ChatbotCharacter();

    setupCamera();
    initFloor();
    initSkybox();
    initTVs();
    
    setupLighting();

}

function initSkybox(){
    
    //  load skybox texture
    var skyboxText = texLoader.load("../assets/models/chatbot/towercropped.jpg");
    skyboxText.wrapS = THREE.RepeatWrapping;
    skyboxText.wrapT = THREE.RepeatWrapping;
    skyboxText.repeat.set( 20, 20 );

    // create skybox mesh
    var skyboxMesh = new THREE.Mesh(new THREE.SphereGeometry(10,10,10), new THREE.MeshPhongMaterial({map: skyboxText}));
    skyboxMesh.geometry.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));

    // position skyboxc at center
    skyboxMesh.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(5));
    skyboxMesh.position.set(0,0,0)

    // modify fog in skybox shader
    skyboxMesh.material.onBeforeCompile = ModifyFogShader;

    // add skybox to scene
    scene.add( skyboxMesh );
}

function initFloor(){

    // load floor texture
    var floorTexture = texLoader.load("../assets/models/chatbot/oscillascope.jpg");

    // create floor mesh
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshPhongMaterial({map: floorTexture}));
    floor.rotateX(-Math.PI/2);
    floor.position.set(0,0,0)

    floor.material.onBeforeCompile = ModifyFogShader;

    // add floor to scene
    scene.add( floor );

}

function setupCamera(){
    // setup perspective camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 450 ); // 0.05
    camera.position.copy(new THREE.Vector3(0,5,5));
    camera.lookAt(new THREE.Vector3(0,4,0));

    // make main camera
    scene.userData.mainCamera = camera;

    // if(DEBUG_MODE){
    //     orbitControls = new OrbitControls( camera, renderer.domElement );
    //     orbitControls.update();
    // }
    

}

function setupLighting(){
    
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.5);
    hemiLight.position.set( 0, 600, 0 );
    scene.add( hemiLight );

}

document.addEventListener('resize', ()=>{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}, false);


UpdateManager.add(()=>{

    // if(DEBUG_MODE) orbitControls.update();
    chatBot.update();


    // TODO: Move into separate function
    faceHelper.getFaceCenterPosition().then((position)=>{
        if(position != null){
            
            chatBot.isInsanityReset = false;
            if(!DEBUG_MODE) camera.position.copy(new THREE.Vector3(position.x,position.y,-0.8).multiplyScalar(-2).add(new THREE.Vector3(0,5,2)));
        
        } else if(!chatBot.isInsanityReset && !chatBot.insanityLerpTween.isPlaying()) {

            chatBot.initInsanityLerp(0);
            socket.emit("insanityUpdate", 0);
            chatBot.isInsanityReset = true;

        }
    })

})

UpdateManager.add((delta, time)=> {

    scene.userData.globalDelta = delta;
    scene.userData.globalTime = time;

});