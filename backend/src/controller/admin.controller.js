const User = require("../models/user.model");
const File = require("../models/file.model");

// Get all users
const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get all files
const getAllFiles = async (req, res) => {
  try {

    const files = await File.find()
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      files
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Admin dashboard stats
const getStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();

    const totalFiles = await File.countDocuments();

    const users = await User.find();

    let totalStorageUsed = 0;

    users.forEach((user) => {
      totalStorageUsed += user.storageUsed;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFiles,
        totalStorageUsed
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const imagekit = require("../config/imagekit");

// Delete file
const deleteFileAdmin = async (req, res) => {
  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    await imagekit.deleteFile(file.fileId);

    await File.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getAllUsers,
  getAllFiles,
  getStats,
  deleteUser,
  deleteFileAdmin
};