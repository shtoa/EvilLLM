import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { UpdateManager } from '../managers/UpdateManager.js';

export function initRenderer(canvas){
    
    var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, canvas: canvas} );
    renderer.setClearColor( 0x000000, 0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    return renderer;
}

document.addEventListener('resize', ()=>{
    
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);
