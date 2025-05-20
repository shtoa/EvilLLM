// import mediapipe 
import {
    GestureRecognizer,
    FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
  
/* 

Hand Track Helper Class 
    1. Initialize Model;
    2. Initialize Video;
    3. Get Results;
*/

// code developed myself based on code from: https://codepen.io/mediapipe-preview/pen/zYamdVd?editors=1010

export class HandTrackHelper {

    // global gestureRecognizer variable
    gestureRecognizer;
    video;

    constructor(){
        // FIX ME: Remove or Add to this
    }


    // create gestureRecognizer
    async createGestureRecognizer() {
        const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: "video"
        });

    };

    async initVideo(){

        this.video = await document.createElement('video')
        this.video.id = "video";
        this.video.setAttribute('width', 250);
        this.video.setAttribute('height', 250);
        this.video.autoplay = true;
        this.video.setAttribute("muted", true)

        await document.body.appendChild(this.video)
        

        // enable video stream
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            this.video.srcObject = stream;
        }).catch((err) => {
            console.log("An error occurred! " + err);
        });

        this.video.hidden = true;

    }

    async getPose(){
        
        const nowInMs = Date.now();
        var result = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);

        // check if there are hands in the video frame
        if(typeof(result) != undefined){
            // check if there is a poseRecognized
        
            if(result.gestures.length > 0){
                console.log(result.gestures[0][0].categoryName);
                return result.gestures[0][0].categoryName;
            } else {
                 return "No_Hands"
            }
        } 

        console.log(result);


    }
}

