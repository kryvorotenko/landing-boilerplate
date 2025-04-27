#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

if (process.argv.length < 3) {
    console.log('You have to provide a name for your app.');
    console.log('For example :');
    console.log('    npx landing-boilerplate my-app');
    process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const GIT_REPO = "https://github.com/kryvorotenko/landing-boilerplate";

async function createProject() {
    try {
        console.log(`Creating project directory: ${projectPath}`);

        try {
            await fs.mkdir(projectPath);
        } catch (err) {
            if (err.code === 'EEXIST') {
                console.log(`The directory ${projectName} already exists. Please choose a different name.`);
                process.exit(1);
            } else {
                throw err;
            }
        }

        console.log('Downloading files...');
        execSync(`git clone --depth 1 ${GIT_REPO} ${projectPath}`, { stdio: 'inherit' });

        process.chdir(projectPath);

        console.log('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        console.log('Removing unnecessary files...');
        execSync('npx rimraf ./.git', { stdio: 'inherit' });

        const binPath = path.join(projectPath, 'bin');
        try {
            await fs.rmdir(binPath, { recursive: true });
            console.log('Removed bin directory.');
        } catch (err) {
            console.log('No bin directory to remove.');
        }

        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = require(packageJsonPath);

        packageJson.name = projectName;
        delete packageJson.bin;

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

        console.log('Project setup complete. You are ready to go!');
    } catch (error) {
        console.error('An error occurred during the setup:', error.message);
        process.exit(1);
    }
}

createProject();
