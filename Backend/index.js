const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const mainRouter = require('./routes/main.router');

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

if (process.argv.length > 2) {
yargs(hideBin(process.argv))
.command('start', 'Start a new server', {}, startServer)
.command('init', 'Initialise a new repository', {}, initRepo)
.command('add <file>',  'Add a file to the repository',
    (yargs) => {
    yargs.positional("file", {
        describe: "File to be added to the staging area",
        type: "string",
    });
    },
    argv => addRepo(argv.file)
    )
    .command('commit <message>', 'Commit the staged files with a message',
    (yargs) => {
        yargs.positional("message", {
            describe: "Commit message",
            type: "string",
        });
    },
    (argv) => {
        commitRepo(argv.message);
    }
    )
    .command('push', 'Push the committed changes to the remote repository', {}, pushRepo)
    .command('pull', 'Pull the latest changes from the remote repository', {}, pullRepo)
    .command('revert <commit>', 'Revert to a specific commit',
    (yargs) => {
        yargs.positional("commit", {
            describe: "Commit hash to revert to",
            type: "string",
        });
    },
    (argv) => {       
         revertRepo(argv.commit);
    }
    ) .help().argv;
} else {
    startServer();
}
        

// .demandCommand(1, 'You need to specify a command').help().argv;

function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors({origin: '*'}));
    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI = process.env.MONGODB_URI;
    mongoose.connect(mongoURI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));

    app.use('/', mainRouter);


    let user = "test";
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        socket.on("joinRepo", (userId) => {
            user = userId;
            console.log("------");
            console.log(user);
            console.log("------");
            socket.join(userId);
            console.log(`User joined repository: ${userId}`);
        });
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });

    const db = mongoose.connection;
    db.once('open', async () => {
       console.log("CRUD Operation called");
        // CRUD OPERATIONS
         server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    });

}