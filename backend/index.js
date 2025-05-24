import express from 'express';
import {Server} from 'socket.io';
import http from 'http'

import { process_voice_prompt } from './utils/ollama/audio_prompt.js';
import { process_text_prompt } from './utils/ollama/text_prompt.js';
import { insanityLevel } from './utils/ollama/text_prompt.js';

export{io};

import { checkDependencies } from './utils/checkDependencies.js';

if (!checkDependencies()) {
  console.error('Missing dependencies! Halting server startup.');
  process.exit(1);  // Node.js exit to stop program
}

const app = express();
app.use(express.text());
const server = http.createServer(app);      
const io = new Server(server);              
const port = 3000;

const staticPath = "../frontend"
app.use(express.static(staticPath));
app.get('/', (req, res) => {
    res.sendFile("../frontend/index.html");
});

// TODO: move to a seperate file

io.on('connection', (socket) => {
  console.log('A user connected');

    socket.on("text_prompt", (prompt)=>{
        process_text_prompt(prompt, socket);
    })

    socket.on('audio_prompt', (bufferData)=>{
        process_voice_prompt(bufferData, socket);
    })

    socket.on('insanityUpdate', (value)=>{
        insanityLevel.value = value;
    })

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});