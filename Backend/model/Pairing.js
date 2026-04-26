const mongoose = require("mongoose");

const pairingSchema = new mongoose.Schema(
  {
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seniorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevents duplicate active pairings between the same guardian/senior pair
pairingSchema.index({ guardianId: 1, seniorId: 1 }, { unique: true });

module.exports = mongoose.model("Pairing", pairingSchema);