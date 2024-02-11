const mongoose = require("mongoose");

const userLocationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
});

const UserLocation = mongoose.model("UserLocation", userLocationSchema);

module.exports = UserLocation;
