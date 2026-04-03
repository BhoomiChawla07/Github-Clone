const mongoose = require('mongoose');
const Repository = require('../models/repoModel');
const User = require('../models/userModel');
const Issue = require('../models/issueModel');

const createIssue = async (req, res) => {
   const { title, description, repository } = req.body;

    try {
        if (!title || !description || !repository) {
            return res.status(400).json({ message: 'Title, description, and repository ID are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(repository)) {
            return res.status(400).json({ message: 'Invalid repository ID' });
        }
        const repoExists = await Repository.exists({ _id: repository });
        if (!repoExists) {
            return res.status(404).json({ message: 'Repository not found' });
        }
        const newIssue = new Issue({
            title,
            description,
            repository
        });
        const savedIssue = await newIssue.save();
        // Keep the repository's issues list in sync
        await Repository.findByIdAndUpdate(repository, { $addToSet: { issues: savedIssue._id } });
        res.status(201).json({ issueID: savedIssue._id, message: 'Issue created successfully', issue: savedIssue });
    } catch (error) {
        console.error('Error creating issue:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateIssueById = async (req, res) => {
    const issueId = req.params.id;
    const { title, description, status } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            return res.status(400).json({ message: 'Invalid issue ID' });
        }
        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            { title, description, status },
            { new: true, runValidators: true }
        );
        if (!updatedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json({ message: 'Issue updated successfully', issue: updatedIssue });
    } catch (error) {
        console.error('Error updating issue:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteIssueById = async (req, res) => {
    const issueId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            return res.status(400).json({ message: 'Invalid issue ID' });
        }
        const deletedIssue = await Issue.findByIdAndDelete(issueId);
        if (!deletedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        // Remove the issue reference from the repository's issues list
        await Repository.findByIdAndUpdate(deletedIssue.repository, { $pull: { issues: deletedIssue._id } });
        res.status(200).json({ message: 'Issue deleted successfully', issue: deletedIssue });
    } catch (error) {
        console.error('Error deleting issue:', error.message);  
        res.status(500).json({ message: 'Internal server error' });
        }
};

const getAllIssues = async (req, res) => {
    const { repositoryId } = req.query;
    const filter = {};
    if (repositoryId) {
        if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
            return res.status(400).json({ message: 'Invalid repository ID' });
        }
        filter.repository = repositoryId;
    }
    try {
        const issues = await Issue.find(filter).populate('repository', 'name');
        res.status(200).json(issues);
    } catch (error) {
        console.error('Error fetching issues:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getIssueById = async (req, res) => {
    const issueId = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            return res.status(400).json({ message: 'Invalid issue ID' });
        }
        const issue = await Issue.findById(issueId).populate('repository', 'name');
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
     } catch (error) {
        console.error('Error fetching issue by ID:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
}

