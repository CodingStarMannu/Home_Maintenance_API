const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor");
const VendorLocation = require("../models/vendorLocation");
const nodemailer = require("nodemailer");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error("Error in securing password:", error);
    throw error;
  }
};

const generateAuthToken = (vendor) => {
  const token = jwt.sign({ _id: vendor._id }, process.env.SECRET_KEY);
  return token;
};

const register_vendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(401).json({
        success: false,
        msg: "This email is already registered. Please use another email.",
      });
    }
    const safePassword = await securePassword(password);

    const vendor = await Vendor.create({
      email,
      password: safePassword,
    });
    const savedVendor = await vendor.save();
    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully.",
      data: savedVendor,
    });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate key error. Email already exists.",
      });
    }
    console.error("Error in registering vendor", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const login_vendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ success: false, msg: "Vendor not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        msg: "Incorrect email or password. Please check.",
      });
    }

    const token = generateAuthToken(vendor);

    vendor.token = token;
    await vendor.save();

    return res
      .status(200)
      .json({ success: true, msg: "Login successful", token });
  } catch (error) {
    console.error("Error in vendor login", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const vendor_address = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    if (!vendorId) {
      return res
        .status(400)
        .json({ success: false, msg: "Vendor ID is required" });
    }

    const existingVendor = await Vendor.findById(vendorId);

    if (!existingVendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }

    const updatedFields = {
      name: req.body.name || existingVendor.name,
      mobile: req.body.mobile || existingVendor.mobile,
      address: {
        street: req.body.address.street || existingVendor.address.street,
        city: req.body.address.city || existingVendor.address.city,
        state: req.body.address.state || existingVendor.address.state,
        country: req.body.address.country || existingVendor.address.country,
        zip: req.body.address.zip || existingVendor.address.zip,
      },
    };

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updatedFields,
      { new: true }
    );

    if (!updatedVendor) {
      return res
        .status(500)
        .json({ success: false, msg: "Failed to update vendor" });
    }

    return res.status(200).json({
      success: true,
      msg: "Vendor data saved successfully.",
      data: updatedFields,
    });
  } catch (error) {
    console.error("Error in saving vendor data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const logout_vendor = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    await req.vendor.updateOne({ $pull: { tokens: { token } } });

    res.status(200).json({
      success: true,
      message: "Vendor logout successful",
    });
  } catch (error) {
    console.error("Error in vendor logout", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const vendor = req.vendor;

    const isMatch = await bcryptjs.compare(oldPassword, vendor.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }
    vendor.password = await bcryptjs.hash(newPassword, 10);
    await vendor.save();
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changing password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const secret = process.env.SECRET_KEY + vendor.password;

    const payload = {
      email: vendor.email,
      id: vendor._id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "10m" });
    const resetLink = `http://localhost:3000/vendor/reset-password/${vendor._id}/${token}`;

    const emailSubject = "Password Reset";
    const emailBody = `<p>Hi ${vendor.name},</p>
                            <p>Please click the link below to reset your password:</p>
                            <p>This Link is valid for one time and for 10 mins only</p>
                            <a href="${resetLink}">${resetLink}</a>`;

    const mailOptions = {
      from: process.env.EMAIL_VENDOR,
      to: vendor.email,
      subject: emailSubject,
      html: emailBody,
    };
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        vendor: process.env.EMAIL_VENDOR,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Mail has been sent:-", info.response);

    res.status(200).json({
      success: true,
      message: "Please check your inbox for the password reset link.",
    });
  } catch (error) {
    console.error("Error in forgetting password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both newPassword and confirmPassword are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const vendor = await Vendor.findOne({ _id: id });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const secret = process.env.SECRET_KEY + vendor.password;
    const decoded = jwt.verify(token, secret);

    if (id !== decoded.id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid vendor ID in the token" });
    }

    vendor.password = await bcryptjs.hash(newPassword, 10);
    await vendor.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }
    console.error("Error in resetting password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const vendor_location = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const vendorId = req.vendorId; // Assuming vendorId is available in the request

    if (!vendorId) {
      return res
        .status(400)
        .json({ success: false, msg: "Vendor ID is required" });
    }

    const newVendorLocation = await VendorLocation.create({
      vendor_id: vendorId,
      longitude: longitude,
      latitude: latitude,
    });

    return res.status(200).json({
      success: true,
      msg: "Vendor location saved successfully.",
      data: newVendorLocation,
    });
  } catch (error) {
    console.error("Error in saving vendor location:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  register_vendor,
  login_vendor,
  vendor_address,
  changePassword,
  logout_vendor,
  vendor_location,
  forgetPassword,
  resetPassword,
};
