const client = require("./Redis")

async function setFcmToken(userId, token) {
    try {
        await client.hset("fcm_tokens", userId, token);
        return true;
    } catch (error) {
        console.error("Error setting FCM token:", error);
        return false;
    }
}

async function getFcmToken(userId) {
    try {
        const token = await client.hget("fcm_tokens", userId);
        return token;
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
}

module.exports = { setFcmToken, getFcmToken };