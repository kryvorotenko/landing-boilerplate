#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const GIT_REPO = "https://github.com/kryvorotenko/landing-boilerplate";

if (process.argv.length < 3) {
    console.log('You have to provide a name for your app.');
    console.log('For example:');
    console.log('    npx landing-boilerplate my-app');
    process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);

async function createProjectDirectory() {
    try {
        await fs.mkdir(projectPath);
        console.log(`Created project directory: ${projectPath}`);
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log(`The directory ${projectName} already exists. Please choose a different name.`);
            process.exit(1);
        } else {
            throw err;
        }
    }
}

function executeCommand(command, options = {}) {
    try {
        execSync(command, { stdio: 'inherit', ...options });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        throw error;
    }
}

async function cloneRepo() {
    console.log('Downloading files...');
    executeCommand(`git clone --depth 1 ${GIT_REPO} ${projectPath}`);
}

async function installDependencies() {
    console.log('Installing dependencies...');
    executeCommand('npm install');
}

async function removeUnnecessaryFiles() {
    console.log('Removing unnecessary files...');
    executeCommand('npx rimraf ./.git');
}

async function removeBinDirectory() {
    const binPath = path.join(projectPath, 'bin');
    try {
        await fs.rmdir(binPath, { recursive: true });
        console.log('Removed bin directory.');
    } catch (err) {
        console.log('No bin directory to remove.');
    }
}

async function updatePackageJson() {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = projectName;
    delete packageJson.bin;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function findGitKeepFiles(dir) {
    let filesToDelete = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') {
                filesToDelete = filesToDelete.concat(await findGitKeepFiles(fullPath));
            }
        } else if (entry.isFile() && entry.name === '.gitkeep') {
            filesToDelete.push(fullPath);
        }
    }
    return filesToDelete;
}

async function deleteGitKeepFiles(dir) {
    const files = await findGitKeepFiles(dir);
    for (const file of files) {
        try {
            await fs.unlink(file);
            console.log(`Deleted .gitkeep file: ${file}`);
        } catch (error) {
            console.error(`Error deleting ${file}:`, error);
        }
    }
}

async function createProject() {
    try {
        await createProjectDirectory();
        await cloneRepo();
        process.chdir(projectPath);
        await installDependencies();
        await removeUnnecessaryFiles();
        await removeBinDirectory();
        await updatePackageJson();
        await deleteGitKeepFiles();
        console.log('Project setup complete. You are ready to go!');
    } catch (error) {
        console.error('An error occurred during the setup:', error.message);
        process.exit(1);
    }
}

createProject();
