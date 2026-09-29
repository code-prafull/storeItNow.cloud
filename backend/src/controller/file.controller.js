const imagekit = require("../config/imagekit");
const File = require("../models/file.model");
const User = require("../models/user.model");
const Folder = require("../models/folder.model");

// FolderId diya ho to confirm karo wo user ka apna hi folder hai
const assertOwnFolder = async (folderId, userId) => {
  if (!folderId) return null;

  const folder = await Folder.findById(folderId);

  if (!folder || String(folder.owner) !== String(userId)) {
    return false;
  }

  return folder;
};

const uploadFile = async (req, res) => {
  try {

    const folderCheck = await assertOwnFolder(
      req.body.folderId,
      req.user.id
    );

    if (folderCheck === false) {
      return res.status(403).json({
        success: false,
        message: "Invalid folder"
      });
    }

    const uploadedFile = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
    });

    const savedFile = await File.create({
        fileName: uploadedFile.name,
        fileId: uploadedFile.fileId,
        url: uploadedFile.url,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        folder: req.body.folderId || null,
        owner: req.user.id
    });


    await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: {
          storageUsed: req.file.size
        }
      }
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: savedFile,
    });

  } catch (error) {

    console.log(error);

    // Multer ka size limit cross hua
    if (error && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File is too large. Maximum size is 25 MB.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const getAllFiles = async (req, res) => {
  try {

    const files = await File.find({ owner: req.user.id });

    return res.status(200).json({
      success: true,
      files
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};


const deleteFile = async (req, res) => {
  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    // Sirf apna hi file delete karne do
    if (String(file.owner) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this file"
      });
    }

    await imagekit.deleteFile(file.fileId);

    await User.findByIdAndUpdate(
      file.owner,
      {
        $inc: {
          storageUsed: -file.fileSize
        }
      }
    );

    await File.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getMyFiles = async (req, res) => {
  try {

    const files = await File.find({
      owner: req.user.id
      
    });
     console.log(req.user)

    return res.status(200).json({
       
      success: true,
      files
    });
   

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getStorage = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      used: user.storageUsed,
      total: user.maxStorage
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getFilesByFolder = async (req, res) => {
  try {

    const folderCheck = await assertOwnFolder(
      req.params.folderId,
      req.user.id
    );

    if (folderCheck === false || !folderCheck) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    const files = await File.find({
      folder: req.params.folderId,
      owner: req.user.id
    });

    return res.status(200).json({
      success: true,
      files
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const renameFile = async (req, res) => {
  try {

    const file = await File.findById(req.params.id);

    if (!file || String(file.owner) !== String(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    if (!req.body.fileName || !req.body.fileName.trim()) {
      return res.status(400).json({
        success: false,
        message: "File name is required"
      });
    }

    file.fileName = req.body.fileName.trim();
    await file.save();

    return res.status(200).json({
      success: true,
      file
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const searchFiles = async (req, res) => {
  try {

    const query = (req.query.query || "").trim();

    // Empty query = sab files wapas; regex ko escape taaki "( " jaisa
    // input 500 na de
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const files = await File.find({
      owner: req.user.id,
      fileName: {
        $regex: escaped,
        $options: "i"
      }
    });

    return res.status(200).json({
      success: true,
      files
    });

  } catch (error) {

    return res.status(500).json({
      success: false
    });

  }
};

const getRecentFiles = async (req, res) => {
  try {

    const files = await File.find({
      owner: req.user.id
    })
    .sort({ createdAt: -1 })
    .limit(10);

    return res.status(200).json({
      success: true,
      files
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


module.exports = {
  uploadFile,
  getAllFiles,
  deleteFile,
  getMyFiles,
  getStorage,
  getFilesByFolder,
  renameFile,
  searchFiles,
   getRecentFiles
};