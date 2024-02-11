const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
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
        zip: String,
    },
    profileViews: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: '',
    }
}, {
    timestamps: true,
});



const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
