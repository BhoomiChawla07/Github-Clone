const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();
userRouter.get('/allUsers', userController.getAllUsers);
userRouter.post('/signup', userController.signUp);
userRouter.post('/login', userController.login);
userRouter.get('/userProfile/:id', userController.getUserProfile);
userRouter.get('/:id/following', userController.getFollowing);
userRouter.get('/:id/followers', userController.getFollowers);
userRouter.post('/:id/follow', userController.followUser);
userRouter.post('/:id/unfollow', userController.unfollowUser);
userRouter.put('/updateProfile/:id', userController.updateUserProfile);
userRouter.delete('/deleteProfile/:id', userController.deleteUserProfile);

module.exports = userRouter;