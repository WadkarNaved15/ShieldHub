const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  label: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true // in meters
  },
  kid: {
  type: String, // or ObjectId if referencing another model
  required: false,
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Geofence', geofenceSchema);
