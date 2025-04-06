const io = require("socket.io-client");
const { DeviceEventEmitter } = require("react-native");
const BackgroundService = require("react-native-background-actions").default;

const SOCKET_SERVER_URL = process.env.WEBSOCKET_URI;

let socket = null;
let connectToSocket = false;

const options = {
    taskName: "HerShield",
    taskTitle: "Listening for Emergencies",
    taskDesc: "Keeping you safe.",
    taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
    },
    color: "#FF0000",
    parameters: {
        delay: 5000,
    },
    foregroundServiceType: "mediaPlayback|microphone",
};

// ✅ Establish WebSocket connection
const connectSocket = () => {
    if (socket) {
        if (socket.connected) {
            console.log("✅ Already connected to WebSocket.");
            return socket;
        }
        console.log("⚠️ Closing previous WebSocket before reconnecting...");
        socket.disconnect(); // Ensure cleanup before creating a new one
    }

    console.log("🔄 Connecting to WebSocket at:", SOCKET_SERVER_URL);
    socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on("connect", () => {
        console.log("🟢 Connected to WebSocket");
    });

    socket.on("connect_error", (error) => {
        console.error("❌ WebSocket Connection Error:", error.message);
    });
    socket.on("invalid_pin", (data) => {
        alert(`Error: ${data.message}`);
        console.error("❌ Invalid PIN");
    });

    socket.on("disconnect", () => {
        console.log("🔴 WebSocket Disconnected.");
        if (connectToSocket) {
            console.log("🔄 Attempting reconnection...");
            setTimeout(connectSocket, 3000); // Manually trigger reconnection if needed
        }
    });

    return socket;
};

// ✅ Disconnect WebSocket cleanly
const disconnectSocket = async () => {
    try {
        connectToSocket = false; // Prevent background task from reconnecting

        if (socket) {
            console.log("🚫 Disabling WebSocket auto-reconnection...");
            socket.io.opts.reconnection = false; // Disable automatic reconnection

            console.log("❌ Disconnecting WebSocket...");
            socket.disconnect(); // Properly disconnect
            socket.close(); // Ensure the connection is fully closed

            socket = null; // Clear socket reference after disconnection
        } else {
            console.warn("⚠️ No active WebSocket connection found.");
        }
    } catch (error) {
        console.error("❌ Error disconnecting WebSocket:", error);
    }
};

// ✅ Background Task for maintaining WebSocket connection
const backgroundTask = async (taskData) => {
    console.log("🚀 Background service started...");

    while (connectToSocket) {
        if (!socket || !socket.connected) {
            console.log("⚠️ Socket disconnected, reconnecting...");
            connectSocket();
        }
        await new Promise(resolve => setTimeout(resolve, taskData.delay || 5000));
    }
    console.log("⏹ Background service stopped.");
};

// ✅ Start Background Service
const startBackgroundService = async () => {
    if (!socket) {
        socket = connectSocket();
    }
    connectToSocket = true; // Enable background task to reconnect if needed
    await BackgroundService.start(backgroundTask, options);
};

// ✅ Stop Background Service & Disconnect WebSocket
const stopBackgroundService = async () => {
    console.log("⏹ Stopping background service...");
    connectToSocket = false; // Prevent background task from reconnecting
    await BackgroundService.stop(); // Stop background task
    await disconnectSocket(); // Ensure WebSocket is also disconnected
};

module.exports = {
    connectSocket,
    disconnectSocket,
    startBackgroundService,
    stopBackgroundService,
};
