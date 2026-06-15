const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    return res.status(200).json({
      success: true,
      user
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
  getProfile
};