import { UpdateManager } from "../managers/UpdateManager.js";
import { initScenePass } from "./initScenePass.js";
import { initRenderer } from "./initRenderer.js";
import { initComposer } from "./postProcessing.js";
import { container, canvas } from "./initCanvas.js"; 
import { postPass } from "./initScenePass.js";

export var composer;
export var renderer;

export function initRenderPipeline(){
    // setup renderer
    renderer = initRenderer(canvas);
    composer = initComposer(renderer);
    container.appendChild( renderer.domElement );

    initScenePass();
}

UpdateManager.add(()=>{
    
    composer.render(); 
    renderer.setRenderTarget(null); 

    // do post processing pass
    postPass.renderMesh.material.uniforms.tex.value = composer.renderTarget2.texture; 
    postPass.renderMesh.material.uniforms.tex.needsUpdate = true;

    renderer.render(postPass.scene, postPass.camera);

})
