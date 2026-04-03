const mongoose = require('mongoose');
const Repository = require('../models/repoModel');
const User = require('../models/userModel');
const Issue = require('../models/issueModel');

const createRepository = async (req, res) => {
    const owner = req.params.ownerId || req.body.owner;
    const { name, issues, description, visibility } = req.body;
    let { content } = req.body;

    // Normalize `content` into a string to match the schema.
    if (content === undefined || content === null) {
        content = '';
    } else if (Array.isArray(content) || typeof content === 'object') {
        content = JSON.stringify(content);
    } else {
        content = String(content);
    }

    try{
        if (!name) {
            return res.status(400).json({ message: 'Repository name is required' });
        }
        if (!owner) {
            return res.status(400).json({ message: 'Owner ID is required' });
        }
        if(!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ message: 'Invalid owner ID' });
        }

        const ownerExists = await User.exists({ _id: owner });
        if (!ownerExists) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        if(issues && !Array.isArray(issues)) {
            return res.status(400).json({ message: 'Issue should be valid' });
        }
        const newRepo = new Repository({
            owner,
            name,
            issues,
            content,
            description,
            visibility
        });
        const savedRepo = await newRepo.save();

        // Keep the user's repositories list in sync
        await User.findByIdAndUpdate(owner, { $addToSet: { repositories: savedRepo._id } });

        res.status(201).json({ repoID: savedRepo._id, message: 'Repository created successfully', repo: savedRepo });
    } catch (error) {
        console.error('Error creating repository:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllRepository = async (req, res) => {
    try {
        const repositories = await Repository.find().populate('issues').populate('owner');

        // If an existing repository has owner=null, attempt to recover it from the user's `repositories` list.
        const missingOwnerRepoIds = repositories
            .filter(r => !r.owner)
            .map(r => r._id);

        if (missingOwnerRepoIds.length > 0) {
            const users = await User.find({ repositories: { $in: missingOwnerRepoIds } });
            const repoOwnerMap = new Map();
            users.forEach((user) => {
                (user.repositories || []).forEach((repoId) => {
                    if (!repoOwnerMap.has(repoId.toString())) {
                        repoOwnerMap.set(repoId.toString(), user);
                    }
                });
            });

            repositories.forEach((repo) => {
                if (!repo.owner) {
                    const owner = repoOwnerMap.get(repo._id.toString());
                    if (owner) {
                        repo.owner = owner;
                    }
                }
            });
        }

        res.status(200).json(repositories);
    } catch (error) {
        console.error('Error fetching repositories:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const fetchRepositoryById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid repository ID' });
    }
    try {
        const repository = await Repository.findById(id).populate('issues').populate('owner');
        if (!repository) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        res.status(200).json(repository);
    } catch (error) {   
        console.error('Error fetching repository by ID:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const fetchRepositoryByName = async (req, res) => {
    const { name } = req.params;
    try {
        const repository = await Repository.findOne({ name }).populate('issues').populate('owner');
        if (!repository) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        res.status(200).json(repository);
    } catch (error) {
        console.error('Error fetching repository by name:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const fetchRepositiesByCurrentUser = async (req, res) => {
    const { userID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {      
        const repositories = await Repository.find({ owner: userID }).populate('issues').populate('owner');
        res.status(200).json(repositories);
    } catch (error) {
        console.error('Error fetching repositories by user ID:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateRepositoryById = async (req, res) => {
    const { id } = req.params;
    const { name, description, content, visibility } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid repository ID' });
    }
    try {
        const updatedRepo = await Repository.findByIdAndUpdate(
            id,
            { name, description, content, visibility },
            { $push: { content: newContent } },
            { new: true, runValidators: true, }
        ).populate('issues').populate('owner');
        if (!updatedRepo) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        res.status(200).json({ message: 'Repository updated successfully', repo: updatedRepo });
    } catch (error) {   
        console.error('Error updating repository:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const toggleVisibilityById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid repository ID' });
    }
    try {
        const updatedRepo = await Repository.findByIdAndUpdate(
            id,
            { visibility: req.body.visibility },
            { new: true, runValidators: true }
        ).populate('issues').populate('owner');
        if (!updatedRepo) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        res.status(200).json({ message: 'Repository visibility toggled successfully', repo: updatedRepo });
    } catch (error) {
        console.error('Error toggling repository visibility:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteRepositoryById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid repository ID' });
    }
    try {
        const deletedRepo = await Repository.findByIdAndDelete(id);
        if (!deletedRepo) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        res.status(200).json({ message: 'Repository deleted successfully', repo: deletedRepo });
    } catch (error) {
        console.error('Error deleting repository:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createRepository,
    getAllRepository,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositiesByCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById
};