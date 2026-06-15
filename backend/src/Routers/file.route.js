const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middleware");
const getFilesByFolder = require("../controller/file.controller").getFilesByFolder;
const renameFile = require("../controller/file.controller").renameFile;
const searchFiles = require("../controller/file.controller").searchFiles;
const getRecentFiles = require("../controller/file.controller").getRecentFiles;
const {
 uploadFile,
  getAllFiles,
  deleteFile,
  getMyFiles,
  getStorage,

} = require('../controller/file.controller');


router.get(
  "/recent",
  auth,
  getRecentFiles
);


router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadFile
);


router.get(
  "/folder/:folderId",
  auth,
  getFilesByFolder
);


router.patch(
  "/:id",
  auth,
  renameFile
);

router.get(
  "/search",
  auth,
  searchFiles
);



router.get("/", getAllFiles);
router.get("/storage", auth, getStorage);
router.get("/my-files", auth, getMyFiles);
router.delete("/:id", deleteFile);


module.exports = router;