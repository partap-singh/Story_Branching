const express = require('express');
const router = express.Router();
const {
    getStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory
} = require('../controllers/storyController');

router.route('/')
    .get(getStories)
    .post(createStory);

router.route('/:id')
    .get(getStoryById)
    .put(updateStory)
    .delete(deleteStory);

module.exports = router;
