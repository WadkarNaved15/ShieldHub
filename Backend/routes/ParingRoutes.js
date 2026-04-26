const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const auth = require("../middleware/auth"); // your existing auth middleware
const {
  generatePairingCode,
  verifyPairingCode,
  getLinkedGuardians,
  getLinkedSeniors,
  unlinkSenior,
} = require("../controllers/paring.controller");

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/**
 * Limits how often a Guardian can request new codes.
 * Prevents brute-force code harvesting.
 */
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 code generations per 15 min per IP
  message: {
    success: false,
    message: "Too many code generation attempts. Please wait 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limits how often a Senior can attempt code verification.
 * Prevents brute-forcing the 6-digit space (1,000,000 combinations).
 */
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per 15 min per IP
  message: {
    success: false,
    message: "Too many verification attempts. Please wait 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Guardian: generate a pairing code
router.post("/generate", auth, generateLimiter, generatePairingCode);

// Senior: enter the code to pair
router.post("/verify", auth, verifyLimiter, verifyPairingCode);

// Senior: view all their linked guardians
router.get("/guardians", auth, getLinkedGuardians);

// Guardian: view all their linked seniors
router.get("/seniors", auth, getLinkedSeniors);

// Guardian: unlink a specific senior
router.delete("/:seniorId", auth, unlinkSenior);

module.exports = router;