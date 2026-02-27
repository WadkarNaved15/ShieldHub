const axios = require('axios');
const polyline = require('@mapbox/polyline');
const { getPointSafety, fetchGoogleRoutes } = require('../utils/safeRoute');



const  getSafeRoutes = async (req, res) => {
    const { origin, destination } = req.body;
    console.log("Received Safe Route Request:", req.body);

    if (!origin || !destination) {
        return res.status(400).json({ error: "Origin and Destination are required" });
    }

    try {
        console.log(`1. Fetching routes from ${origin} to ${destination}...`);
        const googleRoutes = await fetchGoogleRoutes(origin, destination);

        if (googleRoutes.length === 0) {
            return res.status(404).json({ error: "No routes found" });
        }

        console.log(`2. Analyzing ${googleRoutes.length} routes for safety...`);
        const analyzedRoutes = [];

        // Loop through every route Google gave us
        for (const route of googleRoutes) {
            
            // Decode the polyline into a list of [lat, lon]
            const allPoints = polyline.decode(route.overview_polyline.points);
            
            // Optimization: Sample every 10th point (approx every 300-500m)
            // Checking every single point is too slow
            const samplePoints = allPoints.filter((_, i) => i % 10 === 0);

            // Parallel Process: Fetch scores for all sample points at once
            const scorePromises = samplePoints.map(pt => getPointSafety(pt[0], pt[1]));
            const scores = await Promise.all(scorePromises);

            // Calculate Stats
            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            const avgScore = totalScore / scores.length;
            const minScore = Math.min(...scores); // The "danger bottleneck"

            analyzedRoutes.push({
                // Include standard Google data (Duration, Distance, encoded path)
                summary: route.summary,
                duration: route.legs[0].duration,
                distance: route.legs[0].distance,
                polyline: route.overview_polyline.points,
                
                // OUR CUSTOM SAFETY DATA
                safety_score: Math.round(avgScore),
                min_safety_score: Math.round(minScore),
                risk_level: avgScore > 80 ? 'Safe' : (avgScore > 50 ? 'Moderate' : 'Risky'),
                recommendation: (avgScore > 75 && minScore > 40) // Simple recommendation logic
            });
        }

        // Sort: Safest route first
        analyzedRoutes.sort((a, b) => b.safety_score - a.safety_score);

        // Send to Frontend
        res.json({
            success: true,
            recommended_route_index: 0, // The first one is now the safest
            routes: analyzedRoutes
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = { getSafeRoutes };