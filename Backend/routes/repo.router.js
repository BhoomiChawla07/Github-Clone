const express = require('express');
const repoController = require('../controllers/repoController');

const repoRouter = express.Router();

repoRouter.get('/allRepositories', repoController.getAllRepository);
repoRouter.post('/createRepository', repoController.createRepository);
repoRouter.post('/createRepository/:ownerId', repoController.createRepository);
repoRouter.get('/repository/name/:name', repoController.fetchRepositoryByName);
repoRouter.get('/repository/user/:userID', repoController.fetchRepositiesByCurrentUser);
repoRouter.get('/repository/:id', repoController.fetchRepositoryById);
repoRouter.put('/repository/update/:id', repoController.updateRepositoryById);
repoRouter.patch('/repository/toggle/:id', repoController.toggleVisibilityById);
repoRouter.delete('/repository/delete/:id', repoController.deleteRepositoryById);

module.exports = repoRouter;