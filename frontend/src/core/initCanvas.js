export var container, canvas; 

export function initCanvas(){

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.id = "container"

    canvas = document.createElement('canvas');
    canvas.id = "mainCanvas"

    container.appendChild(canvas);

    canvas.onclick = ()=>{
        canvas.requestPointerLock(); // lock pointer to allow to look around
    }
}