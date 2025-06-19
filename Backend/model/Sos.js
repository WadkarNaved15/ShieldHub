const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
    userId: String, // The victim's user ID
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number] // [longitude, latitude]
    },
    helping_users: [
        {
            userId: String, // Helper's user ID
            distance_traveled: Number, // Distance in KM
            time_of_arrival: Date, // When they reached the location
            points_awarded: Number // Points earned
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

// 2D Geospatial Index for efficient queries
SOSSchema.index({ location: "2dsphere" });

const SOS = mongoose.model('SOS', SOSSchema);
module.exports = SOS;
