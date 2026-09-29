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

// Profile ka naam update karna (email change verification maangta hai,
// isliye woh yahan allow nahi)
const updateProfile = async (req, res) => {
  try {

    const name = (req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    if (name.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name is too long"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
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
  getProfile,
  updateProfile
};
