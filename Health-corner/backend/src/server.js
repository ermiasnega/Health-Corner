const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

// wrap Express with HTTP server so socket.io can attach
const server = http.createServer(app);

// initialize socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

// make io accessible inside controllers via req.app.get("io")
app.set("io", io);

// socket.io events
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // user joins their conversation rooms
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // user leaves a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});