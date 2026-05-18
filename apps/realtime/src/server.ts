import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

type Player = {
  id: string;
  name: string;
};

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  let player: Player | null = null;

  // ---- AUTH HANDSHAKE ----
  socket.on("auth:init", (payload) => {
    player = {
      id: payload?.id ?? socket.id,
      name: payload?.displayName ?? "Guest",
    };

    socket.emit("chat:ready");
    socket.emit("score:ready");

    console.log("✅ Auth init:", player.name);
  });

  // ---- CHAT ----
  socket.on("chat:send", (msg) => {
    if (!player) return;

    io.emit("chat:message", {
      user: player.name,
      text: msg,
      ts: Date.now(),
    });
  });

  // ---- SCORE ----
  socket.on("score:update", ({ gameSlug, score }) => {
    if (!player) return;

    socket.broadcast.emit("score:update", {
      gameSlug,
      user: player.name,
      score,
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.REALTIME_PORT || 4001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Realtime server running on :${PORT}`);
});
