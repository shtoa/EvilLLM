    
var currentSubtitleIndex = 0;
var subtitleDict = {};
var allSubtitlesDict;
var currentResponse;

import { debugLog } from "../debug/debugLog.js";
import { socket } from "../socket.js";
import { TWEEN } from 'https://unpkg.com/three@0.128.0/examples/jsm/libs/tween.module.min.js';


socket.on('hasFinishedProcessing',(hasFinishedProcessing, results) => {
            
    if(hasFinishedProcessing) loadSubtitleDict(results.wordsResult);
             
});

var subtitleFade = {value : 0};
var subTitleFadeTween = new TWEEN.Tween(subtitleFade).to({value: 0}, 0).easing(TWEEN.Easing.Cubic.InOut).onComplete(()=>{console.log(subtitleFade.value)})

export function loadSubtitleDict(path){
    
    debugLog("loading subtitle dict");

    currentSubtitleIndex = 0;

    fetch(path).then(response =>response.json()).then(
        (res)=>{
            
            subtitleDict = res["segments"].flatMap((segment)=>segment["words"]);
            allSubtitlesDict = res["segments"].flatMap((segment)=>segment["words"]);

            subtitleFade.value = 0;

            // based on number of words scale the font size
            updateFontSize();

            currentResponse = res["text"];
            document.getElementById("subtitles").innerHTML = currentResponse.split(" ").map((word) => {return `<span class=word>${word}</span>`}).join(" ");

            debugLog("loaded subtitle dict");

            
        }
    );
}  

function updateFontSize(){

}
    
export function updateSubtitles(currentTime){
    if(subtitleDict.length > 0 && currentTime >= subtitleDict[0].start && currentTime < subtitleDict[0].end){ 
        
        currentSubtitleIndex += 1;
        subtitleDict.shift()

        var i = 0; 
        for(var child of Array(...document.getElementById("subtitles").children)){
            

            if(currentSubtitleIndex == i){
                child.classList.add("active");
                
            } else{
                child.classList.remove("active");
            }

            i += 1;

        }
    } else if (subtitleDict.length == 0 && !subTitleFadeTween.isPlaying()) {

        console.log("tween subtitleFade");
        subTitleFadeTween = new TWEEN.Tween(subtitleFade).to({value: 1}, 5000).easing(TWEEN.Easing.Cubic.InOut).onComplete(()=>{console.log(subtitleFade.value)}).start();

    }
}
