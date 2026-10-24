const Review = require('../models/Review');

// @desc    Get reviews for a story or all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const query = {};
        if (req.query.storyId) {
            query.storyId = req.query.storyId;
        }

        const reviews = await Review.find(query).sort({ createdAt: -1 });

        // Calculate average rating
        let average = '5.0';
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
            average = (sum / reviews.length).toFixed(1);
        }

        const starCount = Math.round(Number(average));
        const starsHtml = '★'.repeat(starCount) + '☆'.repeat(Math.max(0, 5 - starCount));

        res.status(200).json({
            success: true,
            count: reviews.length,
            average,
            starsHtml,
            data: reviews
        });
    } catch (err) {
        console.error('getReviews error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create a new community review & rating
// @route   POST /api/reviews
// @access  Public (or Authenticated)
exports.createReview = async (req, res) => {
    try {
        const { storyId, userId, userName, rating, comment } = req.body;

        if (!storyId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide storyId, rating, and comment'
            });
        }

        const reviewId = req.body.id || `rev_${Date.now()}`;
        const now = new Date();
        const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const review = await Review.create({
            id: reviewId,
            storyId,
            userId: userId || 'anonymous',
            userName: userName || 'Reader',
            rating: Number(rating),
            comment,
            timestamp: req.body.timestamp || formattedTimestamp
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.error('createReview error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};
