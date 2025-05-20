import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

import { camera } from './initScene.js';
import { scene } from './initScene.js';


export function initComposer(renderer){
    var composer = new EffectComposer(renderer);
    composer.renderToScreen = false;
    var renderPass = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),0.4,0.1,0.55);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    return composer;
}