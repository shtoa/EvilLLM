import {FaceTrackHelper} from "../faceTracking/faceTrackHelper.js"
export var faceHelper;

export async function preloadFaceHelper(){
    faceHelper = new FaceTrackHelper();
    await faceHelper.initVideo();
    await faceHelper.createFaceLandmarker();
}

