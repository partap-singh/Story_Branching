const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Story = require('../models/Story');
const Review = require('../models/Review');

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/story_branching';
        console.log(`Connecting to MongoDB for seeding at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB.');

        const dbJsonPath = path.join(__dirname, '../../frontend/db.json');
        if (!fs.existsSync(dbJsonPath)) {
            console.error(`❌ db.json not found at: ${dbJsonPath}`);
            process.exit(1);
        }

        const raw = fs.readFileSync(dbJsonPath, 'utf8');
        const db = JSON.parse(raw);

        // 1. Seed Users with bcrypt hashing
        console.log('\n--- Seeding Users ---');
        let userCount = 0;
        const usersToSeed = db.Users || [];

        for (const u of usersToSeed) {
            const cleanEmail = (u.email || '').toLowerCase().trim();
            if (!cleanEmail) continue;

            const existing = await User.findOne({ email: cleanEmail });
            if (!existing) {
                const rawPassword = u.password || 'password123';

                await User.create({
                    name: u.name || 'Story Reader',
                    email: cleanEmail,
                    password: rawPassword,
                    role: u.role === 'Admin' ? 'Admin' : 'Reader',
                    xp: u.xp || 100,
                    completedStories: u.completedStories || [],
                    usedFreeRetreatStories: u.usedFreeRetreatStories || []
                });
                userCount++;
            }
        }
        console.log(`✅ Seeded ${userCount} new users (Total in collection: ${await User.countDocuments()})`);

        // 2. Seed Stories
        console.log('\n--- Seeding Stories ---');
        let storyCount = 0;
        const storiesToSeed = db.Stories || [];

        for (const s of storiesToSeed) {
            const storyId = s.id || `story_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const existing = await Story.findOne({ id: storyId });

            if (!existing) {
                const rawNodes = Array.isArray(s.nodes) ? s.nodes : [];
                const nodes = rawNodes.map((n, nIdx) => ({
                    id: n.id || `node_${nIdx + 1}`,
                    title: n.title || `Scene ${nIdx + 1}`,
                    text: n.text || '',
                    location: n.location || 'Unknown Location',
                    characters: Array.isArray(n.characters) ? n.characters : [],
                    isEnding: Boolean(n.isEnding),
                    endingType: n.endingType || null,
                    choices: Array.isArray(n.choices) ? n.choices.map((c, cIdx) => ({
                        id: c.id || `c_${nIdx + 1}_${cIdx + 1}`,
                        text: c.text || 'Continue',
                        targetNodeId: c.targetNodeId || ''
                    })) : []
                }));
                const startNodeId = s.startNodeId || (nodes[0] ? nodes[0].id : 'node_start');

                await Story.create({
                    id: storyId,
                    title: s.title || 'Untitled Adventure',
                    author: s.author || 'Admin',
                    authorId: s.authorId || 'usr_admin_1',
                    genre: (s.genre || 'adventure').toLowerCase(),
                    status: s.status || 'published',
                    description: s.description || 'An interactive branching story universe.',
                    imageURL: s.imageURL || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
                    startNodeId: startNodeId,
                    nodes: nodes
                });
                storyCount++;
            }
        }
        console.log(`✅ Seeded ${storyCount} new stories (Total in collection: ${await Story.countDocuments()})`);

        // 3. Seed Reviews
        console.log('\n--- Seeding Community Reviews ---');
        let reviewCount = 0;
        const reviewsToSeed = db.Reviews || [];

        for (const r of reviewsToSeed) {
            const reviewId = r.id || `rev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const existing = await Review.findOne({ id: reviewId });

            if (!existing) {
                await Review.create({
                    id: reviewId,
                    storyId: r.storyId || 'story_lost_kingdom',
                    userId: r.userId || 'usr_reader_demo',
                    userName: r.userName || 'Alex Vance',
                    rating: Number(r.rating) || 5,
                    comment: r.comment || 'Thrilling interactive adventure!',
                    timestamp: r.timestamp || new Date().toISOString()
                });
                reviewCount++;
            }
        }
        console.log(`✅ Seeded ${reviewCount} new reviews (Total in collection: ${await Review.countDocuments()})`);

        console.log('\n🎉 Database Seeding Completed Successfully!');
        console.log('\nDefault Test Credentials:');
        console.log(' - Admin:  email: admin@gmail.com   password: admin123');
        console.log(' - Reader: email: testreader@example.com password: password123');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed with error:', err);
        process.exit(1);
    }
};

seedData();
