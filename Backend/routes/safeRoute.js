const express = require('express');
const router = express.Router();
const { getSafeRoutes } = require('../controllers/safeRoute.controller');

router.post("/", getSafeRoutes);


module.exports = router;