const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        required: true,
        unique: true,
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String
    },
    profileViews: {
        type: Number,
        default: 0
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    token: {
        type: String,
        default: '',
    }
},
{
    timestamps: true,
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
