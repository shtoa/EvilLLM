import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

export const UpdateManager = {
    listeners: [],
    clock: new THREE.Clock(),

    add(callback){
        this.listeners.push(callback);
    },

    remove(callback){
        this.listeners = this.listeners.filter(fn => fn !== callback);
    },

    update(){
        requestAnimationFrame(() => this.update());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        for (const listener of this.listeners) {
            try {
                listener(delta, elapsed);
            } catch (error) {
                console.error('Error in update listener:', error);
            }
        }

    },
    
    start() {
        this.update();
    }

}