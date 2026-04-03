const fs = require('fs').promises;
const path = require('path');
const {s3, S3_BUCKET} = require('../config/aws-config');


async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), '.myGit');
    const commitsPath = path.join(repoPath, 'commits');
    try {
        const listParams = {
            Bucket: S3_BUCKET,
            Prefix: 'commits/',
        };
        const data = await s3.listObjectsV2(listParams).promise();
        const commits = data.Contents.map(item => item.Key.split('/')[1]).filter((value, index, self) => self.indexOf(value) === index);
        for (const commitId of commits) {
            const commitDir = path.join(commitsPath, commitId);
            await fs.mkdir(commitDir, { recursive: true });
            const commitFiles = data.Contents.filter(item => item.Key.startsWith(`commits/${commitId}/`));
            for (const file of commitFiles) {
                const fileKey = file.Key;
                const fileName = fileKey.split('/').pop();
                const filePath = path.join(commitDir, fileName);
                const params = {
                    Bucket: S3_BUCKET,
                    Key: fileKey,
                };
                const fileContent = await s3.getObject(params).promise();
                await fs.writeFile(filePath, fileContent.Body);
            }
            console.log(`Pulled commit ${commitId} from S3 successfully.`);
        }
    } catch (error) {
        console.error('Error pulling from S3: ', error);
        return;
    }
}

module.exports = { pullRepo };