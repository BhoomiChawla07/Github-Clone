const fs = require('fs').promises;
const path = require('path');
const {v4: uuidv4} = require('uuid');

async function commitRepo(message) {
    const repoPath = path.resolve(process.cwd(), '.myGit');
    const stagingPath = path.join(repoPath, 'staging');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        const commitId = uuidv4();
        const commitDir = path.join(commitsPath, commitId);
        await fs.mkdir(commitDir, { recursive: true });
    
        const files = await fs.readdir(stagingPath); 
        for (const file of files) {
            await fs.copyFile(path.join(stagingPath, file), path.join(commitDir, file));
        }
        await fs.writeFile(path.join(commitDir, 'commit.json'), JSON.stringify({ message, timestamp: new Date().toISOString() }, null, 2));
        console.log(`Commit ${commitId} created successfully with message: "${message}"`);
    }
     catch (error) {
            console.error('Error reading staging area:', error);
            return;
        }
}

module.exports = { commitRepo };
