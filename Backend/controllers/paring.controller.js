const crypto = require("crypto");
const redis = require("../utils/Redis"); // your existing Redis client
const Pairing = require("../model/Pairing");
const SeniorProfile = require("../model/SeniorProfile");

// ─── Constants ────────────────────────────────────────────────────────────────

const CODE_TTL_SECONDS = 600; // 10 minutes
const CODE_PREFIX = "shieldhub:pairing:code:";
const GUARDIAN_PREFIX = "shieldhub:pairing:guardian:";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a 6-digit cryptographically random code and
 * retries up to 10 times to guarantee global uniqueness in Redis.
 */
const generateUniqueCode = async () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(crypto.randomInt(100000, 999999));
    const exists = await redis.get(`${CODE_PREFIX}${code}`);
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique pairing code. Try again.");
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/senior/pairing/generate
 * Actor: Guardian
 *
 * Generates a short-lived 6-digit numeric code that the
 * Guardian shares verbally or visually with the Senior.
 * Any previously pending code for this Guardian is invalidated first.
 */
const generatePairingCode = async (req, res) => {
  try {
    const guardianId = req.user._id.toString();
    const guardianKey = `${GUARDIAN_PREFIX}${guardianId}`;

    // Invalidate any existing pending code for this guardian
    const existingCode = await redis.get(guardianKey);
    if (existingCode) {
      await redis.del(`${CODE_PREFIX}${existingCode}`);
      await redis.del(guardianKey);
    }

    const code = await generateUniqueCode();

    // Key 1: code → guardianId  (Senior uses this during verify)
    await redis.set(`${CODE_PREFIX}${code}`, guardianId, "EX", CODE_TTL_SECONDS);

    // Key 2: guardianId → code  (lets us invalidate on re-generation or successful pair)
    await redis.set(guardianKey, code, "EX", CODE_TTL_SECONDS);

    return res.status(200).json({
      success: true,
      data: {
        code,
        expiresInSeconds: CODE_TTL_SECONDS,
        message: "Share this code with the senior. It expires in 10 minutes.",
      },
    });
  } catch (error) {
    console.error("[generatePairingCode]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate pairing code. Please try again.",
    });
  }
};

/**
 * POST /api/senior/pairing/verify
 * Actor: Senior
 * Body: { code: "123456" }
 *
 * Validates the code against Redis, then creates a permanent
 * Pairing document and updates the SeniorProfile in MongoDB.
 * The code is deleted after first use (one-time token).
 */
const verifyPairingCode = async (req, res) => {
  try {
    const { code } = req.body;
    const seniorId = req.user._id.toString();

    // ── Input validation ────────────────────────────────────────
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code format. Please enter a 6-digit number.",
      });
    }

    // ── Redis lookup ────────────────────────────────────────────
    const guardianId = await redis.get(`${CODE_PREFIX}${code}`);

    if (!guardianId) {
      return res.status(400).json({
        success: false,
        message: "Code is invalid or has expired. Ask your guardian for a new one.",
      });
    }

    // ── Business rules ──────────────────────────────────────────
    if (guardianId === seniorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot pair with yourself.",
      });
    }

    const existing = await Pairing.findOne({ guardianId, seniorId });
    if (existing?.isActive) {
      return res.status(409).json({
        success: false,
        message: "This guardian is already linked to your account.",
      });
    }

    // ── Persist to MongoDB ──────────────────────────────────────
    // Upsert handles the rare edge case where a deactivated pairing is re-established
    await Pairing.findOneAndUpdate(
      { guardianId, seniorId },
      { guardianId, seniorId, isActive: true, linkedAt: new Date() },
      { upsert: true, new: true }
    );

    // Denormalise guardian into SeniorProfile for fast reads
    await SeniorProfile.findOneAndUpdate(
      { userId: seniorId },
      {
        $addToSet: {
          guardians: { guardianId, linkedAt: new Date() },
        },
      },
      { upsert: true, new: true }
    );

    // ── Invalidate the one-time code from Redis ─────────────────
    await redis.del(`${CODE_PREFIX}${code}`);
    await redis.del(`${GUARDIAN_PREFIX}${guardianId}`);

    return res.status(200).json({
      success: true,
      message: "Successfully paired. Your guardian can now view your location and activity.",
      data: { guardianId },
    });
  } catch (error) {
    console.error("[verifyPairingCode]", error.message);
    return res.status(500).json({
      success: false,
      message: "Pairing failed. Please try again.",
    });
  }
};

/**
 * GET /api/senior/pairing/guardians
 * Actor: Senior
 *
 * Returns all active guardians linked to the authenticated senior.
 */
const getLinkedGuardians = async (req, res) => {
  try {
    const seniorId = req.user._id;

    const pairings = await Pairing.find({ seniorId, isActive: true })
      .populate("guardianId", "name email phone profilePicture")
      .sort({ linkedAt: -1 });

    const guardians = pairings.map((p) => ({
      guardianId: p.guardianId._id,
      name: p.guardianId.name,
      email: p.guardianId.email,
      phone: p.guardianId.phone,
      profilePicture: p.guardianId.profilePicture,
      linkedAt: p.linkedAt,
    }));

    return res.status(200).json({ success: true, data: guardians });
  } catch (error) {
    console.error("[getLinkedGuardians]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch guardians.",
    });
  }
};

/**
 * GET /api/senior/pairing/seniors
 * Actor: Guardian
 *
 * Returns all active seniors linked to the authenticated guardian.
 */
const getLinkedSeniors = async (req, res) => {
  try {
    const guardianId = req.user._id;

    const pairings = await Pairing.find({ guardianId, isActive: true })
      .populate("seniorId", "name email phone profilePicture")
      .sort({ linkedAt: -1 });

    const seniors = pairings.map((p) => ({
      seniorId: p.seniorId._id,
      name: p.seniorId.name,
      email: p.seniorId.email,
      phone: p.seniorId.phone,
      profilePicture: p.seniorId.profilePicture,
      linkedAt: p.linkedAt,
    }));

    return res.status(200).json({ success: true, data: seniors });
  } catch (error) {
    console.error("[getLinkedSeniors]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seniors.",
    });
  }
};

/**
 * DELETE /api/senior/pairing/:seniorId
 * Actor: Guardian
 *
 * Soft-deletes the pairing (isActive: false) and removes
 * the guardian entry from the senior's SeniorProfile.
 */
const unlinkSenior = async (req, res) => {
  try {
    const guardianId = req.user._id;
    const { seniorId } = req.params;

    const pairing = await Pairing.findOneAndUpdate(
      { guardianId, seniorId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!pairing) {
      return res.status(404).json({
        success: false,
        message: "Active pairing not found.",
      });
    }

    // Remove guardian from the senior's denormalised list
    await SeniorProfile.findOneAndUpdate(
      { userId: seniorId },
      { $pull: { guardians: { guardianId } } }
    );

    return res.status(200).json({
      success: true,
      message: "Senior unlinked successfully.",
    });
  } catch (error) {
    console.error("[unlinkSenior]", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to unlink senior.",
    });
  }
};

module.exports = {
  generatePairingCode,
  verifyPairingCode,
  getLinkedGuardians,
  getLinkedSeniors,
  unlinkSenior,
};