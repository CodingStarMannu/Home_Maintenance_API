const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Vendor = require("../models/vendor");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, msg: "Authentication failed. Token missing." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ _id: decoded._id, token });
    const vendor = await Vendor.findOne({ _id: decoded._id, token });

    if (user) {
      req.user = user;
      req.userId = decoded._id;
    } else if (vendor) {
      req.vendor = vendor;
      req.vendorId = decoded._id;
    } else {
      return res
        .status(401)
        .json({
          success: false,
          msg: "Authentication failed. User or vendor not found.",
        });
    }

    next();
  } catch (error) {
    console.log("Error in authentication middleware", error);
    return res
      .status(401)
      .json({ success: false, msg: "Authentication failed. Invalid token." });
  }
};

module.exports = authMiddleware;
