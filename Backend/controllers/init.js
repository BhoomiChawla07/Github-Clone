const fs = require('fs');
const path = require('path');

async function initRepo() {
    const repoPath = path.resolve(process.cwd(), '.myGit');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        await fs.promises.mkdir(repoPath, { recursive: true });
        await fs.promises.mkdir(commitsPath, { recursive: true });
        await fs.promises.writeFile(
            path.join(repoPath, 'config.json'), 
            JSON.stringify({ bucket: process.env.S3_BUCKET }, null, 2));
        console.log('Repository initialized successfully.');
    } catch (error) {
        console.error('Error initializing repository:', error);
    }
}

module.exports = { initRepo };