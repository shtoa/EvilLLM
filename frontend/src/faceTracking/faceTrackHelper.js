// import mediapipe 
import {
    FaceLandmarker, FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';

import { FACES, UVS } from "./faceMeshData.js";

/* 

Hand Track Helper Class 
    1. Initialize Model;
    2. Initialize Video;
    3. Get Results;


*/

// code developed myself based on code from: https://codepen.io/mediapipe-preview/pen/OJBVQJm
export class FaceTrackHelper {

    // global gestureRecognizer variable
    faceLandmarker;
    video;
    isDetecting;

    constructor(){

        if(document.getElementById('video') !== null){
            this.video = document.getElementById('video');
            this.video.muted = true;
            this.video.play();
        }

      
        this.expressionsToRecognize = new Map();

        // different expressions 
        this.expressionsToRecognize.set("Open", {categoryNames: ["jawOpen"], avgValue: 0})
        this.expressionsToRecognize.set("Smile", {categoryNames: ["mouthSmileLeft", "mouthSmileRight"], avgValue: 0})
        this.expressionsToRecognize.set("Frown", {categoryNames: ["mouthFrownLeft", "mouthFrownRight"], avgValue: 0})
        this.expressionsToRecognize.set("Kiss", {categoryNames: ["mouthPucker"], avgValue: 0})
        this.expressionsToRecognize.set("Pressed",  {categoryNames: ["mouthPressLeft", "mouthPressRight"], avgValue: 0})

        
    
        this.initializedMesh = false;
        this.mesh;
        this.faceMeshTexture = new THREE.TextureLoader().load("./Assets/Models/face/scaryMask.png");
        this.dummyList = [];

        this.blendShapesToRecognize = new Map([
            ["jawOpen",0],
            ["mouthSmileLeft",0],
            ["mouthSmileRight",0],
            ["mouthFrownLeft",0],
            ["mouthFrownRight",0],
            ["mouthPucker", 0],
            ["mouthPressLeft", 0],
            ["mouthPressRight", 0]
        ])

        this.targetExpressions = Array.from(this.blendShapesToRecognize.keys());

    }


    async createFaceLandmarker() {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          
          runningMode: "VIDEO",
          numFaces: 1
        });

      }
   



    async initVideo(){

        console.log("INITIALIZE VIDEO");
        this.video = await document.createElement('video')
        this.video.id = "video";
        this.video.setAttribute('width', 250);
        this.video.setAttribute('height', 250);
        this.video.autoplay = true;
        this.video.setAttribute("muted", true)
        this.video.setAttribute("controls", true)
        this.video.setAttribute("playsInline", true)
        this.video.setAttribute("hidden", true)
        this.video.hidden = true;
    

        await document.body.appendChild(this.video)

        

        // enable video stream
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            this.video.srcObject = stream;


        }).catch((err) => {
            console.log("An error occurred! " + err);
        });

  
        


    }

    async createFaceMesh(pointsArray){

        var vPos = [];

        pointsArray.forEach((v)=>{
            vPos.push(...Object.values(v));
        })

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute(new Float32Array(vPos),3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(UVS.flat()), 2));
        geometry.setIndex( new THREE.BufferAttribute( new Uint16Array(FACES), 1 ) );
        const material = new THREE.MeshPhongMaterial({transparent: true, side: THREE.DoubleSide});
        material.needsUpdate = true;

        await geometry.computeVertexNormals();
        geometry.getAttribute("uv").needsUpdate = true;

        //geometry.computeBoundingBox();
        //geometry.center();

        const mesh = new THREE.InstancedMesh( geometry, material,10);

       // inspired by https://www.youtube.com/watch?v=dKg5H1OtDK8&ab_channel=WaelYasmina
        for(let i=0; i<10; i++){
            var dummy = new THREE.Object3D();
            
            //random rotaitons
            //dummy.position.copy(new THREE.Vector3().randomDirection().multiplyScalar(0.2))
            //dummy.rotation.set(Math.random()*2*Math.PI, Math.random()*2*Math.PI, Math.random()*2*Math.PI)

            // around a circle
     
            dummy.rotateZ(Math.PI);
            dummy.rotateY(Math.PI);

            //dummy.position.copy(new THREE.Vector3(0,0,0));
            dummy.rotateY(i*2*Math.PI/10);
            //dummy.rotation.set(0,i*2*Math.PI/10,Math.PI);
        
            dummy.scale.x = dummy.scale.y = dummy.scale.z = 0.5;

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            this.dummyList.push(dummy);
        }

        this.mesh = mesh;

    }

    updateFaceMesh(pointsArray){

        var vPos = [];

        pointsArray.forEach((v)=>{
            vPos.push(...Object.values(v));
        })

        this.mesh.geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(vPos),3))
    }


    async getFaceCenterPosition(){
        const nowInMs = Date.now();
        var result = this.faceLandmarker.detectForVideo(this.video, nowInMs);

        this.isDetecting = typeof(result) != undefined

        if(this.isDetecting){

            if(result.faceLandmarks.length > 0){
                this.isDetecting = true;
             
                var pos = result.faceLandmarks[0][4];
                pos = new THREE.Vector3(pos.x, pos.y, pos.z);

                var posNormalized = (pos.sub(new THREE.Vector3(1,1,1).multiplyScalar(0.5))).multiplyScalar(2);

                return posNormalized;


            } 
        } 

    }


    async getFaceLandmarks(){
        
        const nowInMs = Date.now();

        var result = this.faceLandmarker.detectForVideo(this.video, nowInMs);

        // check if there is a face in the video frame
        if(typeof(result) != undefined){

            // check if there is a poseRecognized
            if(result.faceLandmarks.length > 0){
                if(!this.initializedMesh){
                    this.createFaceMesh(result.faceLandmarks[0]);
                    this.initializedMesh = true;
                } else {

                    if(!this.addedMaterial){
                        this.mesh.material.map = this.faceMeshTexture;
                        this.mesh.material.map.needsUpdate = true;
                        this.mesh.material.needsUpdate = true;
             
        
                    }


                    this.updateFaceMesh(result.faceLandmarks[0])
                }
            }
           




            if(result.faceBlendshapes.length > 0){

               var targetShapes = result.faceBlendshapes[0].categories.filter((blendShape) => 
                    this.targetExpressions.includes(blendShape.categoryName)
                );


                var categoryMap = new Map();
                targetShapes.forEach((shape) => {
                    categoryMap.set(shape.categoryName, shape.score)
                })

               

                return this.convertToExpression(categoryMap);
            } else {
                return "No_Face"
            }
        } 
    }

    convertToExpression(targetShapes){
        this.expressionsToRecognize.forEach((value) => {
            value.avgValue = 0;

            value.categoryNames.forEach((category)=>{1
                
                value.avgValue += targetShapes.get(category);
            })

            value.avgValue = value.avgValue / value.categoryNames.length;

        })

        var closestExpression = [...this.expressionsToRecognize.entries()].reduce((left,right) => left[1].avgValue > right[1].avgValue ? left : right);
        
        // tweak and play around with this value
        if(closestExpression[1].avgValue < 0.5){
            return "None";
        } else {
            return closestExpression[0];
        }

        

;
    }

}

