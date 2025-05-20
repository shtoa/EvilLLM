    
var currentSubtitleIndex = 0;
var subtitleDict = {};
var allSubtitlesDict;
var currentResponse;

import { debugLog } from "../debug/debugLog.js";
import { socket } from "../socket.js";


socket.on('hasFinishedProcessing',(hasFinishedProcessing, results) => {
            
    if(hasFinishedProcessing) loadSubtitleDict(results.wordsResult);
             
});


export function loadSubtitleDict(path){
    
    debugLog("loading subtitle dict");

    currentSubtitleIndex = 0;

    fetch(path).then(response =>response.json()).then(
        (res)=>{
            
            subtitleDict = res["segments"].flatMap((segment)=>segment["words"]);
            allSubtitlesDict = res["segments"].flatMap((segment)=>segment["words"]);
            currentResponse = res["text"];


            document.getElementById("subtitles").innerHTML = currentResponse.split(" ").map((word) => {return `<span class=word>${word}</span>`}).join(" ");

            debugLog("loaded subtitle dict");

            
        }
    );
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
    } 
}
    
