import { socket } from "../socket.js";

export function setupVoicePromptRecorder(){
  let mediaRecorder;
  let audioChunks = [];

  // Request mic access
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play(); // Play back the recording
      audioChunks = []; // Clear for next time

      audioBlob.arrayBuffer().then(buffer => {
        socket.emit('audio_prompt', buffer); // Send audio buffer to server
        console.log("Audio sent");
      });
    };
  });

  let isRecording = false;

  document.addEventListener("keydown", event => {
    if (event.code === "Space" && !isRecording && mediaRecorder && !(document.activeElement === document.getElementById('promptInput'))) {
      event.preventDefault(); // avoid page scrolling
      isRecording = true;
      audioChunks = [];
      console.log("Start recording");
      mediaRecorder.start();
    }
  });

  document.addEventListener("keyup", event => {
    if (event.code === "Space" && isRecording && mediaRecorder) {
      console.log("Stop recording");
      mediaRecorder.stop();
      isRecording = false;
    }
  });
}