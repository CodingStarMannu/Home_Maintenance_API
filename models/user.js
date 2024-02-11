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
        default:function() {
            return Math.floor(1000000000 + Math.random() * 9000000000);
        },
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
