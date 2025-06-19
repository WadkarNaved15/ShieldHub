const Redis = require("ioredis");
require("dotenv").config(); // Load environment variables

// Create Redis client
const client = new Redis(process.env.REDIS_URL);

// Handle Redis connection
client.on("connect", () => console.log("Connected to Redis Cloud!"));
client.on("error", (err) => console.error("Redis Connection Error:", err));

// Store user location in Redis


// Fetch user location from Redis


module.exports =  client; 
