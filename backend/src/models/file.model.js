const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fileName: {
      type: String,
      required: true,
    },

    fileId: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    }
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model("File", fileSchema);