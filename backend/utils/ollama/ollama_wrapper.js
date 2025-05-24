export{get_ollama_response}
import ollama from 'ollama';

async function get_ollama_response(prompt){
    try {
        const response = await ollama.generate({
            model: 'llama3.2',
            prompt: `Answer the following in under 12 words:  ${prompt}`, // Answer the following in under 12 words: 
        });
        return response.response;
    } catch (err) {
        throw new Error(`Ollama request failed: ${err.message}`);
    }

}