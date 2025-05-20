import { UpdateManager } from "../managers/UpdateManager.js";
import { TWEEN } from 'https://unpkg.com/three@0.128.0/examples/jsm/libs/tween.module.min.js';
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { socket } from "../socket.js";
import { debugLog } from "../debug/debugLog.js";

export var eyesImagelist = [];
var eyeBlinkTime = { value: 0 };
var eyeBlinkTween = new TWEEN.Tween(eyeBlinkTime).to({value: 3.0}, 500).yoyo(true).repeat(1).easing(TWEEN.Easing.Cubic.InOut);
var hasFinishedProcessing = true; 

loadEyesImageList();
eyeBlinkTween.start();

function loadEyesImageList(){
    var texLoader = new THREE.TextureLoader();
    var imageIndexList = ["1", "2","3","4"];
    var index = 0;
    for(var imageIndex of imageIndexList){
        eyesImagelist[index] = texLoader.load(`../../assets/models/chatbot/eyes/${imageIndex}.png` )

        eyesImagelist[index].minFilter = THREE.NearestFilter;
        eyesImagelist[index].magFilter = THREE.NearestFilter
        index += 1;
    }
    debugLog("eyesLoaded");
}

function getCurrentEyeTexture(currentTime){
    return eyesImagelist[Math.round(currentTime)]
}

function startBlink(){
    if(eyeBlinkTween && !eyeBlinkTween._isPlaying){

        eyeBlinkTween = new TWEEN.Tween(eyeBlinkTime).to({value: 3.0}, 150).yoyo(true).repeat(1).easing(TWEEN.Easing.Cubic.InOut);
        eyeBlinkTween.start();

    } 
}

socket.on("hasFinishedProcessing", (_hasFinishedProcessing,result) =>{
    hasFinishedProcessing = _hasFinishedProcessing;
});

export function getEyeTexture(){
    
    if(hasFinishedProcessing){
        return getCurrentEyeTexture(eyeBlinkTime.value); 

    } else {
        return getCurrentEyeTexture(3); 
    }
}

UpdateManager.add(()=>{

    if(Math.random() > 0.99){
        startBlink();
    }

});