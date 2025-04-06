const { Server } = require("socket.io");

let io; // Declare `io` but don't initialize immediately

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 New WebSocket client connected:", socket.id);
    const {processAudio} = require("../Functions/FeelingUnsafe");
    socket.on("audio_data", (audioData) => {
      processAudio(socket, audioData);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
