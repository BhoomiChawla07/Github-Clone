const fs = require('fs').promises;
const path = require('path');
const {s3, S3_BUCKET} = require('../config/aws-config');


async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), '.myGit');
    const commitsPath = path.join(repoPath, 'commits');

    try {
        const commits = await fs.readdir(commitsPath);
        for (const commitId of commits) {
            const commitDir = path.join(commitsPath, commitId);
            const files = await fs.readdir(commitDir);
            for (const file of files) {
                const filePath = path.join(commitDir, file);
                const fileContent = await fs.readFile(filePath);
                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitId}/${file}`,
                    Body: fileContent,
                };

                await s3.upload(params).promise();
            }

            console.log(`Pushed commit ${commitId} to S3 successfully.`);
        }
    } catch (error) {
        console.error('Error pushing to S3: ', error);
        return;
    }
}

module.exports = { pushRepo };