const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: false,
        unique: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    },
    token: {
        type: String,
        default: '',
    }
},
{
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
