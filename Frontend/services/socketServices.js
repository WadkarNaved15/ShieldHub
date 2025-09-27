const io = require("socket.io-client");
const BackgroundService = require("react-native-background-actions").default;
const {navigate} = require("./navigationService")

const SOCKET_SERVER_URL = process.env.WEBSOCKET_URI; // Change for production
let socket = null;

let connectToSocket = false

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

// const backgroundTask = async () => {

//   while (connectToSocket) {
//     if (!socket || !socket.connected) {
//       console.log("🔌 Reconnecting WebSocket...");
//       connectSocket();
//     }
//     await new Promise((resolve) => setTimeout(resolve, 5000)); // Keep checking every 5 sec
//   }
// };

const backgroundTask = async () => {
  if (!socket) {
    connectSocket(); // connect only once
  }

  while (connectToSocket) {
    // no need to reconnect manually here
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};


const connectSocket = () => {
   if (socket && socket.connected) {
    console.log("⚡ Socket already connected");
    return socket;
  }
      console.log("🔄 Connecting to WebSocket at:", SOCKET_SERVER_URL);
  
      socket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"], // Force WebSocket only
        reconnection: true,
        reconnectionAttempts: 5, // Try reconnecting 5 times
        reconnectionDelay: 3000, // Wait 3 sec before retrying
      });
  
      socket.on("connect", () => {
        console.log("🟢 Connected to WebSocket");
      });
  
      socket.on("connect_error", (error) => {
        console.error("❌ WebSocket Connection Error:", error.message);
      });
  
      socket.on("disconnect", () => {
        console.log("🔴 WebSocket Disconnected, attempting reconnect...");
      });
      socket.on("sos_triggered", () => {
        console.log("🚨 Emergency Detected! Triggering Alert...");
        navigate("EmergencyPage")
      });
      socket.on("invalid_pin", (data) => {
        alert(`Error: ${data.message}`);
        console.error("❌ Invalid PIN");
        navigate("EmergencyPage")
      });
  
      socket.on("sos_alert", () => {
        console.log("🚨 Emergency Detected! Triggering Alert...");
      });
      socket.on("sos_triggered", () => {
        console.log("🚨 Emergency Detected! Triggering Alert...");
      });
      
      return socket;
    }
  
  
  
  

const disconnectSocket = () => {
  connectToSocket = false
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("❌ WebSocket Disconnected");
  }
};

const startBackgroundService = async () => {
  connectToSocket = true
  await BackgroundService.start(backgroundTask, options);
};

const stopBackgroundService = async () => {
  await BackgroundService.stop();
};

module.exports = { getSocket: connectSocket, disconnectSocket, startBackgroundService, stopBackgroundService };