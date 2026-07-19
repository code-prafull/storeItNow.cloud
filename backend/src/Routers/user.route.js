const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");

const {
  getProfile
} = require("../controller/user.controller");

router.get(
  "/profile",
  auth,
  getProfile
);

module.exports = router;