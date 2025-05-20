# <p align =center> ( ` ᢍ ´ ) EvilLLM (  •̀ω  •́  ) <p>
<p align = center> 🦙 *Llama3.2* powered chatbot that becomes more ↻(𓄼 .̀  ̮.́)Ψ evil with time... Frontend built with THREE.js. </p>

--- 

<details open>

<summary > 📦 1. Dependencies 📦 </summary>

--- 

<h2 align=center> FRONTEND (Linked via CDN) </h2>
<hr>
<table align="center">
  <thead>
    <tr>
      <th>Package</th>
      <th>Description</th>
      <th>Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>three.js</strong></td>
      <td>3D graphics library</td>
      <td><a href="https://threejs.org" target="_blank">threejs.org</a></td>
    </tr>
    <tr>
      <td><strong>TWEEN.js</strong></td>
      <td>Animation library</td>
      <td><a href="https://github.com/tweenjs/tween.js" target="_blank">GitHub</a></td>
    </tr>
    <tr>
      <td><strong>OrbitControls</strong></td>
      <td>Camera control helper</td>
      <td><a href="https://threejs.org/docs/#examples/en/controls/OrbitControls" target="_blank">Docs</a></td>
    </tr>
    <tr>
      <td><strong>FBXLoader</strong></td>
      <td>FBX model loader for three.js</td>
      <td><a href="https://threejs.org/docs/#examples/en/loaders/FBXLoader" target="_blank">Docs</a></td>
    </tr>
    <tr>
      <td><strong>socket.io</strong></td>
      <td>WebSocket communication</td>
      <td><a href="https://socket.io/" target="_blank">socket.io</a></td>
    </tr>
  </tbody>
</table>

---

<h2 align=center> BACKEND </h2>


<table align="center">
  <thead>
    <tr>
      <th>Package</th>
      <th>Description</th>
      <th>Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Node.js</strong></td>
      <td>JavaScript runtime for backend logic</td>
      <td><a href="https://nodejs.org" target="_blank">nodejs.org</a></td>
    </tr>
    <tr>
      <td><strong>Python 3 + pip</strong></td>
      <td>Backend scripting &amp; package management</td>
      <td><a href="https://www.python.org/downloads/" target="_blank">python.org</a></td>
    </tr>
    <tr>
      <td><strong>ffmpeg</strong></td>
      <td>Multimedia framework for audio/video tools</td>
      <td><a href="https://ffmpeg.org/download.html" target="_blank">ffmpeg.org</a></td>
    </tr>
    <tr>
      <td><strong>llama3.2 (Ollama)</strong></td>
      <td>Local LLM engine used via Ollama</td>
      <td><a href="https://ollama.com" target="_blank">ollama.com</a></td>
    </tr>
    <tr>
      <td><strong>Rhubarb</strong></td>
      <td><p>Lip sync tool for voice animations.</p> 
        <p>Install under: <code> EvilLLM/backend/utils </code> </p></td>
      <td><a href="https://github.com/DanielSWolf/rhubarb-lip-sync" target="_blank">GitHub</a></td>
    </tr>
  </tbody>
</table>


</br>

--- 

</details>

<details open>

<summary>⚙️  2. Installation  ⚙️</summary>

<h2 align=center> INSTALLATION GUIDE </h2>

</br>

> :warning: Make sure all dependencies listed above have been installed and rhubarb is installed in <code>EvilLLM/backend/utils</code>

1. Clone the Repository:

HTTP:
```bash
git clone https://github.com/shtoa/EvilLLM.git
```
SSH:
```bash
git clone git@github.com:shtoa/EvilLLM.git
```

2. npm install in the root folder:
```bash
npm install
```
3. Locate and run index.js from the backend folder with node (will perform automatic dependency check and prompt installation):

```bash
cd backend
node index.js
```

</details>

