
const User = require('../models/user');
require('dotenv').config();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const securePassword = async(password)=>{
    try {
        const passwordHash = await bcryptjs.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log("Error in securing password with")
    }
}


const generateAuthToken = (user) => {
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY); 
    return token;
}


const register_user = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            return res.status(401).json({ success: false, msg: "This email is already registered. Please use another email." });
        }
        const safePassword = await securePassword(req.body.password);

        const user = await User.create({
            email: req.body.email,
            password: safePassword,
        });
        const user_data = await user.save();
        return res.status(201).json({ success: true, message: 'User registered successfully.', data: user_data });
    } catch (error) {
     
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Duplicate key error. Email already exists.' });
        }
        console.error("Error in registering user", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const user_address = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ success: false, msg: 'User ID is required' });
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const updatedFields = {
            name: req.body.name || existingUser.name,
            mobile: req.body.mobile || existingUser.mobile,
            address: {
                street: req.body.address.street || existingUser.address.street,
                city: req.body.address.city || existingUser.address.city,
                state: req.body.address.state || existingUser.address.state,
                country: req.body.address.country || existingUser.address.country,
                zip: req.body.address.zip || existingUser.address.zip
            }
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

        if (!updatedUser) {
            return res.status(500).json({ success: false, msg: 'Failed to update user' });
        }

        return res.status(200).json({ success: true, msg: 'User data saved successfully.', data: updatedFields });
    } catch (error) {
        console.error('Error in saving user data:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const login_user = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findOne({ email:email  });
        if (!user) {
            return res.status(401).json({ success: false, msg: 'User not found' });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, msg: 'Incorrect email or password please check' });
        }
        const user_id  = user._id
        console.log(user_id);

        const token = generateAuthToken(user_id);

        user.token = token;
        await user.save();

        return res.status(200).json({ success: true, msg: 'Login successful', token });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}



const logout_user = async (req, res) => {
    try {
     
        // const userId = req.userId;
        // console.log(userId);

        // Extracting the token from the request headers
        const token = req.header('Authorization').replace('Bearer ', '');

        // const decodedToken = jwt.decode(token);
        // const user_id = decodedToken._id;
        // console.log(user_id);
        await req.user.updateOne({ $pull: { tokens: { token } } });

        res.status(200).json({
            success: true,
            message: 'User logout successful'
        });
    } catch (error) {
        console.log('Error in user logout', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = req.user; 
        console.log("req.body",  req.body);
        console.log("user", user);
        const isMatch = await bcryptjs.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }
        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();
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

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const secret = process.env.SECRET_KEY + user.password;

        const payload = {
            email: user.email,
            id: user._id
        };

        const token = jwt.sign(payload, secret, { expiresIn: '10m' });
        const resetLink = `http://localhost:3000/user/reset-password/${user._id}/${token}`;

        console.log(resetLink);

        const emailSubject = 'Password Reset';
        const emailBody = `<p>Hi ${user.name},</p>
                            <p>Please click the link below to reset your password:</p>
                            <p>This Link is valid for one time and for 10 mins only</p>
 <a href="${resetLink}">${resetLink}</a>`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: emailSubject,
            html: emailBody
        };
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
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

        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const secret = process.env.SECRET_KEY + user.password;
        const decoded = jwt.verify(token, secret);


        if (id !== decoded.id) {
            return res.status(400).json({ success: false, message: 'Invalid user ID in the token' });
        }

        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();

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

const user_location = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ success: false, msg: 'User ID is required' });
        }

        const { longitude, latitude } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: { location: { longitude, latitude } } }, { new: true });

        if (!updatedUser) {
            return res.status(500).json({ success: false, msg: 'Failed to update user location' });
        }

        return res.status(200).json({ success: true, msg: 'User location saved successfully.', data: updatedUser.location });
    } catch (error) {
        console.error('Error in saving user location:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports ={login_user, register_user, logout_user , resetPassword, changePassword, forgetPassword, user_address, user_location}