const Folder = require("../models/folder.model");

const createFolder = async (req,res)=>{
   try{

      const folder = await Folder.create({
         name: req.body.name,
         owner: req.user.id
      });

      res.status(201).json({
         success:true,
         folder
      });

   }catch(error){
      res.status(500).json({
         success:false
      });
   }
};

const getFolders = async (req, res) => {
  try {

    const folders = await Folder.find({
      owner: req.user.id
    });

    return res.status(200).json({
      success: true,
      folders
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const deleteFolder = async (req, res) => {
  try {

    await Folder.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Folder deleted"
    });

  } catch (error) {

    return res.status(500).json({
      success: false
    });

  }
};

module.exports = {
  createFolder,
  getFolders,
  deleteFolder
};