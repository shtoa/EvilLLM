import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logCheck } from './checkDependencies.js';

export function checkRequirementsPIP() {


    var installedPackages = execSync('pip freeze', {encoding: 'utf-8'})
        .split('\n')
        .map(line=>line.trim())
        .filter(Boolean)
        .map(line=>line.split("==")[0].toLowerCase());

    var requirements = fs.readFileSync("../requirements.txt", 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line=>line.split("==")[0].toLowerCase());
    
    const missingPackages = requirements.filter(pkg => !installedPackages.includes(pkg));

    if (missingPackages.length > 0) {
        console.error('Missing packages:', missingPackages);
        return false;
    } else {
        logCheck("pip packages", "all requirements.txt packages installed");
        return true;
    }
}