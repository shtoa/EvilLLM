import { setupTextPromptInput } from './helperClasses/textPromptInput.js';
import { setupVoicePromptRecorder } from './helperClasses/voicePromptRecorder.js';

import { initFog } from './decoration/fog.js';
import { initScene } from './core/initScene.js';
import { initAmbientSound } from './sounds/ambientSound.js';
import { initCanvas } from './core/initCanvas.js'
import { UpdateManager } from './managers/UpdateManager.js';
import { initRenderPipeline } from './core/initRenderPipeline.js';
import { preloadFaceHelper } from './core/faceHelperInstance.js';

const preload = async() =>{

    // setup face tracking
    await preloadFaceHelper();

    // setup inputs for prompting
    await setupTextPromptInput();
    await setupVoicePromptRecorder();

    // intialize ambient sound
    await initAmbientSound();

    // start init
    await init();

}

const init = async() => {


    await initScene();
    await initCanvas();
    await initRenderPipeline();
    await initFog();

    UpdateManager.start();

}

// begin script execution
preload();