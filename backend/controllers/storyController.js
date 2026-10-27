const Story = require('../models/Story');
const Review = require('../models/Review');

// @desc    Get all stories with optional genre and status filters
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res) => {
    try {
        const query = {};

        if (req.query.genre && req.query.genre !== 'all') {
            query.genre = req.query.genre.toLowerCase();
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const stories = await Story.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: stories.length,
            data: stories
        });
    } catch (err) {
        console.error('getStories error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single story by custom ID or MongoDB ObjectId
// @route   GET /api/stories/:id
// @access  Public
exports.getStoryById = async (req, res) => {
    try {
        const identifier = req.params.id;

        // Try searching by custom id first, then by MongoDB _id
        let story = await Story.findOne({ id: identifier });
        if (!story && identifier.match(/^[0-9a-fA-F]{24}$/)) {
            story = await Story.findById(identifier);
        }

        if (!story) {
            return res.status(404).json({
                success: false,
                message: `Story not found with ID ${identifier}`
            });
        }

        res.status(200).json({
            success: true,
            data: story
        });
    } catch (err) {
        console.error('getStoryById error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new story
// @route   POST /api/stories
// @access  Private (Admin or Authenticated Creator)
exports.createStory = async (req, res) => {
    try {
        const storyData = req.body;

        if (!storyData.id) {
            storyData.id = `story_${Date.now()}`;
        }

        if (!storyData.imageURL) {
            storyData.imageURL =
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
        }

        // Auto-assign startNodeId from first node if missing
        if ((!storyData.startNodeId || storyData.startNodeId === '') && Array.isArray(storyData.nodes) && storyData.nodes.length > 0) {
            storyData.startNodeId = storyData.nodes[0].id;
        }

        const story = await Story.create(storyData);
        res.status(201).json({
            success: true,
            data: story
        });
    } catch (err) {
        console.error('createStory error:', err);
        res.status(400).json({
            success: false,
            message: err.message || 'Failed to create story'
        });
    }
};

// @desc    Update story & node graph
// @route   PUT /api/stories/:id
// @access  Private (Admin/Author)
exports.updateStory = async (req, res) => {
    try {
        const identifier = req.params.id;
        const updateData = { ...req.body };

        // Auto-assign startNodeId from first node if missing
        if ((!updateData.startNodeId || updateData.startNodeId === '') && Array.isArray(updateData.nodes) && updateData.nodes.length > 0) {
            updateData.startNodeId = updateData.nodes[0].id;
        }

        let story = await Story.findOne({ id: identifier });
        if (!story && identifier.match(/^[0-9a-fA-F]{24}$/)) {
            story = await Story.findById(identifier);
        }

        if (!story) {
            // Upsert: create new if doesn't exist
            const newStory = await Story.create({ ...updateData, id: identifier });
            return res.status(200).json({ success: true, data: newStory });
        }

        // Use findOneAndUpdate with $set to properly replace the entire nodes array
        // including all nested choices subdocuments. Object.assign + save() does NOT
        // reliably replace Mongoose subdocument arrays.
        const updated = await Story.findOneAndUpdate(
            { _id: story._id },
            { $set: updateData },
            { new: true, runValidators: false, strict: false }
        );

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (err) {
        console.error('updateStory error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete story and associated reviews
// @route   DELETE /api/stories/:id
// @access  Private (Admin)
exports.deleteStory = async (req, res) => {
    try {
        const identifier = req.params.id;

        let story = await Story.findOne({ id: identifier });
        if (!story && identifier.match(/^[0-9a-fA-F]{24}$/)) {
            story = await Story.findById(identifier);
        }

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        const storyIdToDelete = story.id;
        await Story.deleteOne({ _id: story._id });
        await Review.deleteMany({ storyId: storyIdToDelete });

        res.status(200).json({
            success: true,
            message: `Story '${story.title}' and associated reviews deleted successfully`
        });
    } catch (err) {
        console.error('deleteStory error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
