import { socket } from "../socket.js";
import { currentlyTalking } from "../chatbot/chatbotVoice.js";
import { debugLog } from "../debug/debugLog.js";


var _hasFinishedProcessing = true;

socket.on("hasFinishedProcessing", (hasFinishedProcessing,results)=>{
    _hasFinishedProcessing = hasFinishedProcessing;
})

export function setupTextPromptInput(){
    document.getElementById("promptInput").addEventListener("keypress", (event) => { 
        const input = document.getElementById("promptInput");
        try{
            if(event.key == "Enter" && _hasFinishedProcessing && !currentlyTalking){

                socket.emit('text_prompt', input.value); 
                input.value = "";

            }
        } catch (err){
            debugLog("failed prompt input: " + err);
        }

    })
}