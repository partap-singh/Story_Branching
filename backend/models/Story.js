const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema(
    {
        id: { type: String, default: () => 'c_' + Math.random().toString(36).substring(7) },
        text: { type: String, default: 'Continue' },
        targetNodeId: { type: String, default: '' }
    },
    { _id: false }
);

const nodeSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        title: { type: String, default: 'Scene' },
        text: { type: String, default: '' },
        location: { type: String, default: 'Unknown Location' },
        characters: { type: [String], default: [] },
        isEnding: { type: Boolean, default: false },
        endingType: {
            type: String,
            default: null
        },
        choices: { type: [choiceSchema], default: [] }
    },
    { _id: false }
);

const storySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a story title'],
            trim: true
        },
        author: {
            type: String,
            default: 'Admin'
        },
        authorId: {
            type: String,
            default: 'usr_admin_1'
        },
        genre: {
            type: String,
            default: 'adventure',
            lowercase: true
        },
        status: {
            type: String,
            enum: ['published', 'draft'],
            default: 'published'
        },
        description: {
            type: String,
            required: [true, 'Please provide a story description']
        },
        imageURL: {
            type: String,
            default: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
        },
        startNodeId: {
            type: String,
            required: true
        },
        nodes: {
            type: [nodeSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Story', storySchema);
