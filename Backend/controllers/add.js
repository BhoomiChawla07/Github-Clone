const fs = require('fs').promises;
const path = require('path');

async function addRepo(filePath) {
    const reposPath = path.resolve(process.cwd(), '.myGit');
    const stagingPath = path.join(reposPath, 'staging');

    try {
        await fs.mkdir(stagingPath, { recursive: true });
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`Files ${fileName} added to staging area successfully.`);
    } catch (error) {
        console.error('Error adding files to staging area:', error);
    }
}

module.exports = { addRepo };