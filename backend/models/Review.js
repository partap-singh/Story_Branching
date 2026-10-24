const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true
        },
        storyId: {
            type: String,
            required: [true, 'Please specify the storyId'],
            index: true
        },
        userId: {
            type: String,
            required: [true, 'Please specify the userId']
        },
        userName: {
            type: String,
            default: 'Anonymous Reader'
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating between 1 and 5'],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: [true, 'Please provide review comment text']
        },
        timestamp: {
            type: String,
            default: () => new Date().toISOString()
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Review', reviewSchema);
