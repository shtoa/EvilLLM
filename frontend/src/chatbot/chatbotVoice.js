        
import { glitchEffect } from '../sounds/glitchEffect.js';   
import { updateSubtitles } from './subtitles.js';
import { updatePhoneme } from './mouthAnimator.js';
import { UpdateManager } from '../managers/UpdateManager.js';
import { socket } from '../socket.js';
import { debugLog } from '../debug/debugLog.js';
            

export var voicePlayer; // player for chatbot voice
var robotThinkingSound; // thinking sound while chatbot is processing
var playerStartTime = 0; // startTime of player
export var currentlyTalking = false; // currently talking; 

const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2; // helper mapping function

export function playThinkingSound(){

    robotThinkingSound = new Tone.Player(".../../assets/sounds/robotThinking.mp3", () => {

        debugLog("thinking sound playing")
        
        robotThinkingSound.loop = true;
        robotThinkingSound.volume.value = -15;
        robotThinkingSound.start().toDestination();

    });
}
export function speakVoiceLine(voiceLine,insanityLevel){
    
    robotThinkingSound.stop(); // stop robot thinking once processing is complete

    Tone.loaded().then(() => {
        debugLog("loaded tone");

        voicePlayer = new Tone.Player(voiceLine, () => {

            voicePlayer.disconnect(); // disconnect player if connected 

            Tone.start().then(()=>{
        
                // transform chatbot voice using pitch shifting and bitcrush effect 
                const pitch = map(insanityLevel,0,1,0,-20);
                const crush = map(insanityLevel,0,1,16,4)
                voicePlayer.connect(glitchEffect(pitch,crush, insanityLevel)); 

                voicePlayer.start(); // play the voiceline 

                debugLog("Audio loaded and started");
                playerStartTime = Tone.now();

            });
        });
    });
}

UpdateManager.add((delta, time)=>{
    
    if (voicePlayer && voicePlayer.state === "started") {
        
        currentlyTalking = true; 
        const currentTime = Tone.now() - playerStartTime;

        updatePhoneme(currentTime);
        updateSubtitles(currentTime);

    } else currentlyTalking = false;
    

})