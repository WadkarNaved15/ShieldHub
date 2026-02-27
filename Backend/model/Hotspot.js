// models/Hotspot.js
const mongoose = require("mongoose");

const hotspotSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: { type: Number, default: 1 }, // 1=low, 5=high
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hotspot", hotspotSchema);
