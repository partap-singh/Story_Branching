const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/story_branching',
            { serverSelectionTimeoutMS: 8000 }
        );
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.message && error.message.includes('whitelist')) {
            console.warn('💡 FIX: Go to MongoDB Atlas → Network Access → Add IP Address → Add your current IP (or 0.0.0.0/0 for dev)');
        } else {
            console.warn('⚠️  Verify your MONGO_URI in backend/.env. The app will continue with local fallback data.');
        }
        // In dev mode, do not crash — local storage fallback keeps the app usable
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
