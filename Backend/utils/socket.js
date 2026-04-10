// const { Server } = require("socket.io");

// let io; // Declare `io` but don't initialize immediately

// const initializeSocket = (server) => {
//   io = new Server(server, {
//     cors: { origin: "*" },
//     transports: ["websocket", "polling"],
//   });

//   io.on("connection", (socket) => {
//     console.log("🟢 New WebSocket client connected:", socket.id);
//     const {processAudio} = require("../Functions/FeelingUnsafe");
//     socket.on("audio_data", (audioData) => {
//       processAudio(socket, audioData);
//     });

//     socket.on("disconnect", () => {
//       console.log("🔴 Client disconnected:", socket.id);
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error("Socket.io has not been initialized!");
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIO };















const emergencyResponders = {}; 
const { Server } = require("socket.io");

let io;
// { emergencyId: { userId: { lat, lon, name } } }

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 New WebSocket client connected:", socket.id);

    // --- 1. Audio Processing (Existing) ---
    const { processAudio } = require("../Functions/FeelingUnsafe");
    socket.on("audio_data", (audioData) => {
      // processAudio(socket, audioData);
    });

    // --- 2. Emergency Room Logic (New) ---
    
    // When a Victim or Responder joins the room
   socket.on("join_emergency", ({ emergencyId, userId }) => {
  const roomId = String(emergencyId);
  socket.join(roomId);

  console.log(`📡 User ${userId} joined Emergency Room: ${roomId}`);

  // 🔥 SEND EXISTING RESPONDERS TO NEW JOINER
  if (emergencyResponders[roomId]) {
    Object.entries(emergencyResponders[roomId]).forEach(([responderId, loc]) => {
      socket.emit("responder_moved", {
        emergencyId: roomId,
        userId: responderId,
        userName: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude
      });
    });
  }
});

    // When Responder moves: Broadcast to everyone in the room except sender
   socket.on("move_responder", (data) => {
  const roomId = String(data.emergencyId);

  if (!emergencyResponders[roomId]) {
    emergencyResponders[roomId] = {};
  }

  emergencyResponders[roomId][data.userId] = {
    latitude: data.latitude,
    longitude: data.longitude,
    name: data.userName,
    phoneNumber: data.phoneNumber
  };

  io.to(roomId).emit("responder_moved", data);
});

socket.on("move_victim", (data) => {
  io.to(String(data.emergencyId)).emit("victim_moved", data);
});

socket.on("resolve_emergency", ({ emergencyId, status }) => {
  const roomId = String(emergencyId);

  
  delete emergencyResponders[roomId]; // 🧹 cleanup

  io.to(roomId).emit("emergency_resolved", { status });
  setTimeout(() => io.in(roomId).socketsLeave(roomId), 5000);
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