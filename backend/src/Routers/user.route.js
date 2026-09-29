const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");

const {
  getProfile,
  updateProfile
} = require("../controller/user.controller");

router.get(
  "/profile",
  auth,
  getProfile
);

router.patch(
  "/profile",
  auth,
  updateProfile
);

module.exports = router;
