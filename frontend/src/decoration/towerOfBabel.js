import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

async function loadTowerBabel(pos){
     var fLoader = new FBXLoader();

        var tower = await fLoader.loadAsync("../assets/models/chatbot/tower.fbx");

        tower.position.copy(new THREE.Vector3(0,-1,0).add(pos));
        tower.scale.copy(new THREE.Vector3(1,1,1).multiplyScalar(0.005));
        tower.rotateY(-Math.PI/2);


        scene.add(tower);

        return tower;
}
