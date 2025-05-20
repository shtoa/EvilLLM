import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { BORDER_SIZE, initBorders } from '../decoration/sceneBorder.js';
import { basicTextureShader } from '../helperClasses/shaderUtils.js';
import { borderList } from '../decoration/sceneBorder.js';

export var postPass = {
    camera : null,
    renderTexture : null,
    scene : null,
    renderMesh : null
}

export function initScenePass(){
      
    postPass.scene = new THREE.Scene();
    
    postPass.camera = new THREE.OrthographicCamera( -window.innerWidth/2-BORDER_SIZE, window.innerWidth/2+BORDER_SIZE, window.innerHeight/2+BORDER_SIZE, -window.innerHeight/2-BORDER_SIZE, 1, 3000 );
    postPass.texture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);

    postPass.renderMesh = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth,window.innerHeight), basicTextureShader(postPass.renderTexture));
    postPass.renderMesh.position.set(0,0,-1500)

    postPass.scene.add(postPass.renderMesh );

    const light = new THREE.AmbientLight(0xffffff,0.5); // soft white light
    postPass.scene.add( light )

    setupLighting();

    initBorders();
    postPass.scene.add(...borderList);
}
function setupLighting(){

    const dirLight2 = new THREE.DirectionalLight( 0xffffff );
    dirLight2.position.set( 0, 200, 100 );
    dirLight2.castShadow = true;
    dirLight2.shadow.camera.top = 180;
    dirLight2.shadow.camera.bottom = - 100;
    dirLight2.shadow.camera.left = - 120;
    dirLight2.shadow.camera.right = 120;

    postPass.scene.add(dirLight2);

}

document.addEventListener('resize', ()=>{
    
    postPass.renderTexture.setSize(window.innerWidth,window.innerHeight);

    postPass.mesh.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

    postPass.scene.camera.left = -window.innerWidth/2-BORDER_SIZE;
    postPass.scene.camera.right = window.innerWidth/2+BORDER_SIZE;
    postPass.scene.camera.top = window.innerHeight/2+BORDER_SIZE;
    postPass.scene.camera.bottom = -window.innerHeight/2-BORDER_SIZE;

    postPass.scene.camera.updateProjectionMatrix()

}, false);

