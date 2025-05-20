import { debugLog } from "../debug/debugLog.js";

    export function glitchEffect(pitch, crush, glitchLevel){

        const bitCrusher = new Tone.BitCrusher(crush); // Lower bits = more digital/glitchy
        const pitchShift = new Tone.PitchShift({ pitch: pitch }); // Can be modulated

        const feedbackDelay = new Tone.FeedbackDelay("8n", 0); // Delay-based glitch

        // Chain effects
        pitchShift.connect(feedbackDelay);
        feedbackDelay.connect(bitCrusher);
        bitCrusher.toDestination();

        debugLog({glitchLevel});
         const glitchLoop = new Tone.Loop((time) => {
            // Randomize pitch every bar
            pitchShift.pitch = Math.random() < glitchLevel+0.2*Math.random() ? pitch + (glitchLevel)*(Math.floor(Math.random() * 10)) : 0;

            // Toggle bit depth
            bitCrusher.bits = Math.random() > 0.5 ? 2 : crush;

            // Change delay time
            feedbackDelay.delayTime.value = Math.random() * 0.25;

            }, `${glitchLevel < 0.2 ? (1/Math.pow(1-glitchLevel,2)): 0.1}n`); 

        glitchLoop.start(0);
        Tone.Transport.start();

        return pitchShift;
    }
