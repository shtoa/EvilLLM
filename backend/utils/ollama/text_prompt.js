export {process_text_prompt, generate_tts, phonemes_from_audio, words_from_audio}
import { get_ollama_response } from "./ollama_wrapper.js";
import { get_insanity_prompt } from './prompt_manipulation/insanityPrompter.js';
import { io } from "../../index.js"; 
import { spawn } from 'child_process';

// Track insanity level - starts at 0 and increases with usage
export var insanityLevel = {value : 0};
const MAX_INSANITY = 10;
const INSANITY_INCREMENT = 1; // Adjust how quickly insanity increases


// return cli promise
function handle_process_result(process, processName, output){
    return new Promise((resolve, reject) => {
        // log process stdout stream
        process.stdout.on('data', (data) => {
            console.log(`${processName} stdout: ${data}`);
        });

        // log process stderror stream
        process.stderr.on('data', (data) => {
            console.error(`${processName} stderr: ${data}`);
        });

        // Catch process errors (e.g., failed to spawn)
        process.on('error', (err) => {
            reject(new Error(`${processName} failed to start: ${err.message}`));
        });

        process.on('close', (code) => {

            console.log(`${processName} process exited with code ${code}`);
            code === 0 ? resolve(output) : reject(new Error(`${processName} failed with code ${code}`));
            
        });
    });
}

function run_process(command, args, processName, outputFile, options = {}) {
    const process = spawn(command, args);
    return handle_process_result(process, processName, outputFile);
}


function generate_tts(text, outputFile){
     return run_process("python", ["./utils/python/tts_audio.py", text, "--output", outputFile], "generate_tts", outputFile);
}

function phonemes_from_audio(audioPath, outputFile){
    return run_process("./utils/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb", ["-f", "json", audioPath, "-o", outputFile], "phonemes_from_audio", outputFile);
}

function words_from_audio(audioPath, outputFile){
    return run_process("python", ["./utils/python/stt_json.py", audioPath, "--output", outputFile], "words_from_audio", outputFile);
}

async function voiceline_pipeline(voiceLine) {
    try {
        // 1. Generate the TTS audio file first
        const ttsResult = await generate_tts(voiceLine, "../frontend/temp/response/voiceLine.wav");

        // 2. Then run phoneme and word extraction in parallel
        const [wordsResult, phonemesResult] = await Promise.all([
            words_from_audio(ttsResult, "../frontend/temp/response/audio_response.json"),
            phonemes_from_audio(ttsResult, "../frontend/temp/response/phonemes_response.json")
        ]);

        console.log("Pipeline complete:", { ttsResult, wordsResult, phonemesResult });

        return {"ttsResult": ttsResult.replace("../frontend",""), 
                "wordsResult": wordsResult.replace("../frontend",""), 
                "phonemesResult": phonemesResult.replace("../frontend","") 
            }
    } catch (err) {
        console.error("Pipeline failed:", err);
    }
}



async function process_text_prompt(prompt,socket){

    io.emit('hasFinishedProcessing', false);
    var pipeline_results;

    try{
        // Increase insanity level with each request
        insanityLevel.value = Math.min(insanityLevel.value + INSANITY_INCREMENT, MAX_INSANITY);
        
        // Modify the prompt based on current insanity level
        const modifiedPrompt = get_insanity_prompt(insanityLevel.value, prompt);
        const insanityLevelNorm = insanityLevel.value / MAX_INSANITY;
        
        // Use the modified prompt instead of the original
        const response = await get_ollama_response(modifiedPrompt);
        
        //  Let the client know the current insanity level
        socket.emit('insanityUpdate', {value: insanityLevelNorm});

        // handle TTS (text to speech) -> STT (speech to text) analysis
        pipeline_results = await voiceline_pipeline(response); 

        console.log(insanityLevel.value, modifiedPrompt)


    } catch(err){

        console.error("process_prompt failed:", err);
        // Optionally emit an error status
        socket.emit('processingError', err.message);

    } finally {

        io.emit('hasFinishedProcessing', true, pipeline_results);

    }
}
