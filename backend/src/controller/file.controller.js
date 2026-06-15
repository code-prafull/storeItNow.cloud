const imagekit = require("../config/imagekit");
const File = require("../models/file.model");
const User = require("../models/user.model");

const uploadFile = async (req, res) => {
  try {

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

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const getAllFiles = async (req, res) => {
  try {

    const files = await File.find();

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

    const files = await File.find({
      folder: req.params.folderId
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

    const file = await File.findByIdAndUpdate(
      req.params.id,
      {
        fileName: req.body.fileName
      },
      {
        new: true
      }
    );

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

    const query = req.query.query;

    const files = await File.find({
      owner: req.user.id,
      fileName: {
        $regex: query,
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