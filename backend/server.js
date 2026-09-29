// Render jaise hosts par IPv6 route nahi hota — Gmail SMTP ko IPv6 address par
// ENETUNREACH aata tha, isliye DNS se hamesha IPv4 pehle chuno.
const dns = require("node:dns");
if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
}

const app = require('./src/app');

// Render/Vercel jaise hosts $PORT dete hain — hardcode 3000 unpar fail karata tha.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});