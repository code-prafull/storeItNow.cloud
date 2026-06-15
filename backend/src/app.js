
require("dotenv").config();

const express = require('express');
const fileRoutes = require("./Routers/file.route");
const connectDB = require('./db/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routers/auth.route');
const folderRoutes = require('./Routers/folder.route');
const userRoutes = require("./Routers/user.route");
const cors = require("cors");
const adminRoutes = require("./Routers/admin.route");
const paymentRoutes = require("./Routers/payment.route");


const app = express();


connectDB();


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(
  "/api/payment",
  paymentRoutes
);

module.exports = app;