const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readdirAsync = promisify(fs.readdir);
const copyFileAsync = promisify(fs.copyFile);

async function revertRepo(commit) {
    const repoPath = path.resolve(process.cwd(), '.myGit');
    const commitsPath = path.join(repoPath, 'commits');
    
    try {
        const commitDir = path.join(commitsPath, commit);
        const files = await readdirAsync(commitDir);
        const parentDir = path.resolve(repoPath, '..'   );

        for (const file of files) {
            await copyFileAsync(path.join(commitDir, file), path.join(parentDir, file));
        }
        console.log(`Reverted to commit ${commit} successfully.`);

    } catch (error) {
        console.error('Error reverting to commit:', error);
        return;
    }
}

module.exports = { revertRepo };