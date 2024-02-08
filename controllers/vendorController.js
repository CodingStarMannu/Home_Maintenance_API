const Vendor = require('../models/vendor');
require('dotenv').config();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("Error in securing password:", error);
    }
}

const generateAuthToken = (vendor) => {
    const token = jwt.sign({ _id: vendor._id }, process.env.SECRET_KEY); 
    return token;
}

const register_vendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendorData = await Vendor.findOne({ email });
        if (vendorData) {
            return res.status(401).json({ success: false, msg: "This email is already registered. Please use another email." });
        }
        const safePassword = await securePassword(password);

        const vendor = await Vendor.create({
            email,
            password: safePassword,
        });
        const vendor_data = await vendor.save();
        return res.status(201).json({ success: true, message: 'Vendor registered successfully.', data: vendor_data });
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Duplicate key error. Email already exists.' });
        }
        console.error("Error in registering vendor", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const login_vendor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(401).json({ success: false, msg: 'Vendor not found' });
        }

        const isPasswordValid = await bcryptjs.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, msg: 'Incorrect email or password please check' });
        }

        const token = generateAuthToken(vendor);

        vendor.token = token;
        await vendor.save();

        return res.status(200).json({ success: true, msg: 'Login successful', token });

    } catch (error) {
        console.error("Error in vendor login", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const vendor_address = async (req, res) => {
    try {
        const vendorId = req.vendorId;

        if (!vendorId) {
            return res.status(400).json({ success: false, msg: 'vendor ID is required' });
        }

        const existingvendor = await vendor.findById(vendorId);

        if (!existingvendor) {
            return res.status(404).json({ success: false, msg: 'vendor not found' });
        }

        const updatedFields = {
            name: req.body.name || existingvendor.name,
            mobile: req.body.mobile || existingvendor.mobile,
            address: {
                street: req.body.address.street || existingvendor.address.street,
                city: req.body.address.city || existingvendor.address.city,
                state: req.body.address.state || existingvendor.address.state,
                country: req.body.address.country || existingvendor.address.country,
                zip: req.body.address.zip || existingvendor.address.zip
            }
        };

        const updatedvendor = await vendor.findByIdAndUpdate(vendorId, updatedFields, { new: true });

        if (!updatedvendor) {
            return res.status(500).json({ success: false, msg: 'Failed to update vendor' });
        }

        return res.status(200).json({ success: true, msg: 'vendor data saved successfully.', data: updatedFields });
    } catch (error) {
        console.error('Error in saving vendor data:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const logout_vendor = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        await req.vendor.updateOne({ $pull: { tokens: { token } } });

        res.status(200).json({
            success: true,
            message: 'Vendor logout successful'
        });
    } catch (error) {
        console.log('Error in vendor logout', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const vendor = req.vendor; 
        console.log("req.body",  req.body);
        console.log("vendor", vendor);
        const isMatch = await bcryptjs.compare(oldPassword, vendor.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }
        vendor.password = await bcryptjs.hash(newPassword, 10);
        await vendor.save();
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in changing password:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const forgetPassword = async (req, res) => {
    try {

        console.log("forget password",req.body);
        const { email } = req.body;
        console.log(email);

        const vendor = await Vendor.findOne({ email: email });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'vendor not found' });
        }

        const secret = process.env.SECRET_KEY + vendor.password;

        const payload = {
            email: vendor.email,
            id: vendor._id
        };

        const token = jwt.sign(payload, secret, { expiresIn: '10m' });
        const resetLink = `http://localhost:3000/vendor/reset-password/${vendor._id}/${token}`;

        console.log(resetLink);

        const emailSubject = 'Password Reset';
        const emailBody = `<p>Hi ${vendor.name},</p>
                            <p>Please click the link below to reset your password:</p>
                            <p>This Link is valid for one time and for 10 mins only</p>
 <a href="${resetLink}">${resetLink}</a>`;

        const mailOptions = {
            from: process.env.EMAIL_vendor,
            to: vendor.email,
            subject: emailSubject,
            html: emailBody
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                vendor: process.env.EMAIL_vendor,
                pass: process.env.EMAIL_PASSWORD
            }
        });

       const info=  await transporter.sendMail(mailOptions);
       console.log("Mail has been sent:-" ,info.response);

        res.status(200).json({ success: true, message: 'Please check your inbox for the password reset link.' });
    } catch (error) {
        console.error('Error in forgetting password:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Both newPassword and confirmPassword are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
        }

        const vendor = await Vendor.findOne({ _id: id });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'vendor not found' });
        }

        const secret = process.env.SECRET_KEY + vendor.password;
        const decoded = jwt.verify(token, secret);


        if (id !== decoded.id) {
            return res.status(400).json({ success: false, message: 'Invalid vendor ID in the token' });
        }

        vendor.password = await bcryptjs.hash(newPassword, 10);
        await vendor.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        console.error('Error in resetting password:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const vendor_location = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;
        const vendorId = req.vendorId;

        if (!vendorId) {
            return res.status(400).json({ success: false, msg: 'Vendor ID is required' });
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { $set: { location: { type: 'Point', coordinates: [longitude, latitude] } } }, { new: true });

        if (!updatedVendor) {
            return res.status(500).json({ success: false, msg: 'Failed to update vendor location' });
        }

        return res.status(200).json({ success: true, msg: 'Vendor location saved successfully.', data: updatedVendor.location });
    } catch (error) {
        console.error('Error in saving vendor location:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = { register_vendor, login_vendor, vendor_address,changePassword, logout_vendor, vendor_location,forgetPassword,resetPassword };
