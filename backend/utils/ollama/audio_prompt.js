import { debugLog } from "../../../frontend/src/debug/debugLog.js";
import { words_from_audio } from "./text_prompt.js";
import { process_text_prompt } from "./text_prompt.js";
import fs from 'fs/promises';

export {process_voice_prompt}

async function save_audio_buffer(data, outputFile) {
    try {
        await fs.writeFile(outputFile, Buffer.from(data))

        debugLog(`Audio file saved: ${outputFile}`);
        return outputFile;
    } catch (err) {
        console.error("Error saving file:", err);
        throw err;
    }
}

async function convert_audio_prompt(bufferData){ // add optional directory

    const audioPrompt = await save_audio_buffer(bufferData, "../frontend/temp/audio_prompt/audio_prompt.webm");
    const jsonOutputFile = await words_from_audio(audioPrompt, "../frontend/temp/audio_prompt/audio_prompt.json");

    return jsonOutputFile;
}

async function process_voice_prompt(bufferData, socket){
    try{ 
        const jsonOutputFile = await convert_audio_prompt(bufferData);
        const jsonData = await fs.readFile(jsonOutputFile, 'utf-8');

        const parsed = JSON.parse(jsonData);
        await process_text_prompt(parsed["text"], socket);

        debugLog("voice prompt json parsed")

    } catch (err) {
        console.error("Error processing voice prompt:", err);
    }
}