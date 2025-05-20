import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { worleyNoise } from '../helperClasses/shaderUtils.js';
import { scene } from '../core/initScene.js';
import { UpdateManager } from '../managers/UpdateManager.js';

export const BORDER_SIZE = 40;
var borderBottom, borderTop, borderLeft, borderRight;
export var borderList;

var borderVertex, borderFragment, borderMaterial;
function initBorderShader(){
    borderVertex = `
    varying vec4 vPos;
    varying vec2 vUv;
    uniform float time;
    varying vec3 vnormal;
    uniform float rollTime;

    void main() {
   
    
        vPos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position = vPos;
        vUv = uv;

        vnormal = normal;

    }
`;

    borderFragment = worleyNoise()+`
    varying vec4 vPos;
    varying vec2 vUv;
    uniform float time;

    void main() {
        
        gl_FragColor = vec4(0.0,(vUv.y/2.0+0.2)*worley(20.0*vec3(vPos.xy,time/100.0),0.01, false).y,0.0,1);
        
    }
    `;
    
    borderMaterial = new THREE.ShaderMaterial( {

        uniforms: {
            time: {value: 0},
        },
    
        // Declare Vertex and Fragment Shader
        vertexShader: borderVertex,
        fragmentShader: borderFragment,

        uniformsNeedUpdate: true,  
    
    } );

}

export function initBorders(){

    initBorderShader();

    borderBottom = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth+2*BORDER_SIZE,2.0*BORDER_SIZE), borderMaterial);
    borderBottom.position.set(0,-window.innerHeight/2,-1500)

    borderTop = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth+2*BORDER_SIZE,2*BORDER_SIZE), borderMaterial);
    borderTop.position.set(0,window.innerHeight/2,-1500)
    borderTop.rotateZ(Math.PI);

    borderLeft = new THREE.Mesh(new THREE.PlaneGeometry(window.innerHeight+2*BORDER_SIZE,2*BORDER_SIZE), borderMaterial);
    borderLeft.position.set(-window.innerWidth/2,0,-1500)
    borderLeft.rotateZ(-Math.PI/2);

    borderRight = new THREE.Mesh(new THREE.PlaneGeometry(window.innerHeight+2*BORDER_SIZE,2*BORDER_SIZE), borderMaterial);
    borderRight.rotateZ(Math.PI/2);
    borderRight.position.set(window.innerWidth/2,0,-1500)

    borderList = [borderBottom, borderTop, borderLeft, borderRight]
}

function onWindowResize(){
    borderBottom.geometry = new THREE.PlaneGeometry(window.innerWidth+2*BORDER_SIZE,2.0*BORDER_SIZE);
    borderBottom.position.set(0,-window.innerHeight/2,-1500);
    
    borderTop.geometry = new THREE.PlaneGeometry(window.innerWidth+2*BORDER_SIZE,2.0*BORDER_SIZE)
    borderTop.position.set(0,window.innerHeight/2,-1500)
    
    borderLeft.geometry = new THREE.PlaneGeometry(window.innerHeight+2*BORDER_SIZE,2*BORDER_SIZE)
    borderLeft.position.set(-window.innerWidth/2,0,-1500)
    
    borderRight.geometry = new THREE.PlaneGeometry(window.innerHeight+2*BORDER_SIZE,2*BORDER_SIZE)
    borderRight.position.set(window.innerWidth/2,0,-1500)
    
}

// subscribe to animate
UpdateManager.add((delta,time)=>{
    if(borderMaterial){
        borderMaterial.uniforms.time.value = time;
        borderMaterial.uniforms.time.needsUpdate = true;
    }
})
