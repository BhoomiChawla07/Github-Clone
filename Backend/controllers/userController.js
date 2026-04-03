const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
var ObjectId = require('mongodb').ObjectId;

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;
async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

const signUp = async (req, res) => {
    const { username, email, password } = req.body;
    try {      
        await connectClient(); 
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        const salt = await  bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            username,
            email,
            password: hashedPassword,
            repositories: [],
            followedUsers: [],
            starRepositories: [],
        };
        const result = await usersCollection.insertOne(newUser);
        
        const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'User registered successfully', token, userId: result.insertedId });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const login = async  (req, res) => {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) { 
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token , userId: existingUser._id});
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const users = await usersCollection
            .find({})
            .project({ password: 0 })
            .toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const user = await usersCollection
            .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getFollowing = async (req, res) => {
    const userId = req.params.id;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const followingIds = user.followedUsers || [];
        const following = await usersCollection
            .find({ _id: { $in: followingIds } })
            .project({ password: 0 })
            .toArray();
        res.json(following);
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getFollowers = async (req, res) => {
    const userId = req.params.id;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const followers = await usersCollection
            .find({ followedUsers: new ObjectId(userId) })
            .project({ password: 0 })
            .toArray();
        res.json(followers);
    } catch (error) {
        console.error('Error fetching followers list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const followUser = async (req, res) => {
    const userId = req.params.id;
    const { targetId } = req.body;
    if (!targetId) {
        return res.status(400).json({ message: 'targetId is required' });
    }

    try {
        if (userId === targetId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetId) });
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { followedUsers: new ObjectId(targetId) } }
        );
        res.json({ message: 'Followed user successfully' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const unfollowUser = async (req, res) => {
    const userId = req.params.id;
    const { targetId } = req.body;
    if (!targetId) {
        return res.status(400).json({ message: 'targetId is required' });
    }

    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { followedUsers: new ObjectId(targetId) } }
        );
        res.json({ message: 'Unfollowed user successfully' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUserProfile = async (req, res) => {
   const userId = req.params.id;
   const {  email, password } = req.body;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        
        const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });  
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }  
         
        const updatedUser = {
            email: email || existingUser.email,
            password: password ? await bcrypt.hash(password, 10) : existingUser.password,
        };
        const result = await usersCollection.findOneAndUpdate({ _id: new ObjectId(userId) }, 
        { $set: updatedUser }, { returnDocument: 'after' });

        res.json({ message: 'User profile updated successfully', user: result.value });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUserProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        await connectClient();
        const db = client.db('mygithub');
        const usersCollection = db.collection('users');
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    signUp,
    login,
    getUserProfile,
    getFollowing,
    getFollowers,
    followUser,
    unfollowUser,
    updateUserProfile,
    deleteUserProfile,
};