import { debugLog } from "../debug/debugLog.js";
import { socket } from "../socket.js";
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

var currentPhoneme;
export var phonemeImageDict = loadPhonemeImageDict("../../assets/models/chatbot/phonemes")
export var phantomPhonemeImageDict = loadPhonemeImageDict("../../assets/models/chatbot/phantomPhonemes");
var phonemeTimeArray;

function loadPhonemeImageDict(path){
    
    var texLoader = new THREE.TextureLoader();
    currentPhoneme = "X";
    var phonemeList = ["X", "A","B","C","D","E","F","G","H"];
    var phonemeImageDict = {};

    for(var phoneme of phonemeList){

        phonemeImageDict[phoneme] = texLoader.load(`${path}/${phoneme}.png` )
        phonemeImageDict[phoneme].minFilter = THREE.NearestFilter;
        phonemeImageDict[phoneme].magFilter = THREE.NearestFilter

    }
    return phonemeImageDict;
}

async function loadPhonemeTimeDict(path){
    debugLog("loading phoneme dict");
    fetch(path).then(response =>response.json()).then(
        (res)=>{

            debugLog("new phonemen dict loaded");
            phonemeTimeArray = res.mouthCues;

        }
    );
}   

export function updatePhoneme(currentTime){

    for(var timeStamp of phonemeTimeArray){

        if(currentTime > timeStamp.start && currentTime < timeStamp.end){
            currentPhoneme = timeStamp.value;
            break; 
        } 

    }
}

export function getMouthTexture() {
    return {normal: phonemeImageDict[currentPhoneme], phantom: phantomPhonemeImageDict[currentPhoneme]}
}

socket.on("hasFinishedProcessing", (hasFinishedProcessing, results)=>{
    if(hasFinishedProcessing) loadPhonemeTimeDict(results.phonemesResult);
});