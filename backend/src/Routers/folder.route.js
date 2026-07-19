const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth.middleware');

const {
  createFolder,
  getFolders,
  deleteFolder
} = require("../controller/folder.controller");

router.post("/", auth, createFolder);

router.get("/", auth, getFolders);

router.delete("/:id", auth, deleteFolder);

module.exports = router;