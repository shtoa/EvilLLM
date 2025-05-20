import { execSync } from 'child_process';
import { checkRequirementsPIP } from './checkRequirementsPIP.js';
import os from 'os';

function checkCommand(name, command, hint) {
  try {
    execSync(command, { stdio: 'ignore' });
    //console.log(`${name} is installed`);

    logCheck(name, `command ran successfully: ${command}`);

    return true;
  } catch (err) {
    console.error(`\n ${name} not found.\n ${hint}`);
    return false;
  }
}

export function logCheck(name, result, ok = true){
    const icon = ok ? '✔' : '✖';
    const status = ok ? result : `Missing - ${result}`;
    console.log(`${icon} ${name.padEnd(20)} ${status}`);
}

function centerText(text, width, char = "=") {
  const columns = Math.min(process.stdout.columns,width);
  const padding = Math.floor((columns - text.length) / 2);
  if (padding > 0) {
    return char.repeat(padding/2) + text + char.repeat(padding/2);
  }
  return text; // text too long to center, just return it
}


export function checkDependencies(){
    
    console.log("\n");
    console.log(centerText(" Checking Dependencies ", 204));

    const platform = os.platform();
    console.log(`Detected OS: ${platform}`);

    var check = true;

    console.log("\n"+centerText(" Python ",220,"-")+"\n")

    // Check python3
    check = checkCommand(
    'python3',
     "python3",
    'Install python3: https://www.python.org/downloads/'
    ); 

    // Check pip
    check = checkCommand(
    'pip',
    platform === 'win32' ? 'pip --version' : 'pip3 --version',
    'Install pip: https://pip.pypa.io/en/stable/installation/'
    ); 

    check = checkRequirementsPIP() && check;

    console.log("\n"+centerText(" Misc. ",219,"-")+"\n")

    // Check ffmpeg
    check = checkCommand(
    'FFmpeg',
    'ffmpeg -version',
    'Install FFmpeg: https://ffmpeg.org/download.html'
    ) && check;

    //Check Rhubarb
    check = checkCommand(
    'Rhubarb Lip Sync',
    platform === 'win32'
        ? '"./utils/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb.exe" --version'
        : './utils/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb',
    'Install Rhubarb Lip Sync: https://github.com/DanielSWolf/rhubarb-lip-sync'
    ) && check;

    console.log("\n"+centerText(" Ollama ",218,"-")+"\n")

    // check ollama exists
    check = checkCommand(
    'Ollama',
    'ollama --version',
    'Install Ollama: https://ollama.com/download // missing ollama or restart vs-code'
    ) && check;


    // check ollama running
    check = checkCommand(
    'Ollama Server',
    'curl http://localhost:11434',
    'please start ollama server'
    ) && check;

    // check ollama running

    console.log("\n");
    console.log(centerText("=",226));

    console.log("\n");
    
    return check;
}