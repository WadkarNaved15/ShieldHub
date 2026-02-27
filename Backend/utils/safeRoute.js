const axios = require('axios');

require('dotenv').config();

const PYTHON_API_URL = `${process.env.ML_API_URL}/predict_safety` || 'http://127.0.0.1:5001/predict_safety';
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
console.log("DEBUG: API Key is ->", process.env.GOOGLE_MAPS_API_KEY);

// ==========================================
// 1. HELPER: Fetch Routes from Google
// =========================================

 const fetchGoogleRoutes = async (origin, destination) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: origin,       // e.g., "Andheri Station, Mumbai"
                destination: destination,
                alternatives: true,   // <--- CRITICAL: Asks for multiple paths
                mode: 'walking',      // or 'driving'
                key: GOOGLE_API_KEY
            }
        });

        if (response.data.status !== 'OK') {
            // --- ADD THESE TWO LINES ---
            console.error("❌ Google API Error Status:", response.data.status);
            console.error("❌ Google API Error Message:", response.data.error_message);
            
            throw new Error(`Google Maps API Error: ${response.data.status}`);
        }

        return response.data.routes;
    } catch (error) {
        console.error("Google Fetch Failed:", error.message);
        return [];
    }
};

// ==========================================
// 2. HELPER: Get Safety Score for ONE Point
// ==========================================
 const getPointSafety = async (lat, lon) => {
    try {
        // Call your Python Microservice
        const response = await axios.post(PYTHON_API_URL, {
            latitude: lat,
            longitude: lon,
            time_hour: new Date().getHours() // Dynamic time
        });
        return response.data.safety_score;
    } catch (error) {
        console.error("Python API Failed:", error.message);
        return 50; // Fallback score if Python is down
    }
};

module.exports = {getPointSafety, fetchGoogleRoutes};