const mongoose = require("mongoose");

const vendorLocationSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
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

const VendorLocation = mongoose.model("VendorLocation", vendorLocationSchema);

module.exports = VendorLocation;
