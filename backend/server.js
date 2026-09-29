const app = require('./src/app');

// Render/Vercel jaise hosts $PORT dete hain — hardcode 3000 unpar fail karata tha.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});