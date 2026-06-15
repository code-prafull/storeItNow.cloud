const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = connectDB;