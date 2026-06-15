const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

const {
  getAllUsers,
  getAllFiles,
  getStats,
  deleteUser,
deleteFileAdmin
} = require("../controller/admin.controller");

const router = express.Router();

// Get dashboard stats
router.get(
  "/stats",
  authMiddleware,
  isAdmin,
  getStats
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  isAdmin,
  getAllUsers
);

// Get all files
router.get(
  "/files",
  authMiddleware,
  isAdmin,
  getAllFiles
);

// Delete user
router.delete(
  "/user/:id",
  authMiddleware,
  isAdmin,
  deleteUser
);

// Delete file
router.delete(
  "/file/:id",
  authMiddleware,
  isAdmin,
  deleteFileAdmin
);

module.exports = router;