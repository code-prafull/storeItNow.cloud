const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB(){
    const uri = process.env.MONGO_URI;
    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    };

    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await mongoose.connect(uri, opts);
            console.log('MongoDB connected');
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
            if (attempt === maxAttempts) {
                console.error('Could not connect to MongoDB after multiple attempts.');
                process.exit(1);
            }
            // exponential backoff before retrying
            const delay = Math.min(1000 * 2 ** attempt, 30000);
            await new Promise((res) => setTimeout(res, delay));
        }
    }
}

module.exports = connectDB;