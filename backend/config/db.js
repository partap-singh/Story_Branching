const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/story_branching');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  Please verify your MONGO_URI in backend/.env (e.g. MongoDB Atlas connection string)');
        // In dev, do not crash process immediately to allow offline inspection if needed
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
