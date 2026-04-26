const mongoose = require("mongoose");

/**
 * SeniorProfile
 *
 * One document per senior user.
 * Deliberately pre-wired with location and geofencing fields
 * so Phase 2 (live tracking) and Phase 3 (geofencing) require
 * zero schema migrations.
 */
const seniorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ─── Guardians ───────────────────────────────────────────────
    // Denormalised list for fast reads (source of truth: Pairing collection)
    guardians: [
      {
        guardianId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ─── Live Location (Phase 2) ─────────────────────────────────
    lastKnownLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    locationUpdatedAt: {
      type: Date,
      default: null,
    },
    isLocationSharingEnabled: {
      type: Boolean,
      default: false,
    },

    // ─── Geofencing (Phase 3) ────────────────────────────────────
    geofences: [
      {
        name: { type: String, required: true },       // e.g. "Home", "Hospital"
        center: {
          type: { type: String, enum: ["Point"], default: "Point" },
          coordinates: { type: [Number] },             // [longitude, latitude]
        },
        radiusMeters: { type: Number, required: true },
        alertOnExit: { type: Boolean, default: true },
        alertOnEntry: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Required for geospatial queries ($near, $geoWithin) in Phase 2 & 3
seniorProfileSchema.index({ lastKnownLocation: "2dsphere" });

module.exports = mongoose.model("SeniorProfile", seniorProfileSchema);