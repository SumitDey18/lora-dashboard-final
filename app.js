

require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();

// ============================
// CONFIG
// ============================
const PORT = process.env.PORT || 5000;
const DEVICE_TOKEN =
  process.env.DEVICE_TOKEN || "DEFENSE_SENDER_SECURE_2026";

// ============================
// MIDDLEWARE
// ============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// HTTP + SOCKET.IO
// ============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ============================
// STATIC FILES
// ============================
app.use(express.static(path.join(__dirname, "public")));

// ============================
// MEMORY STORAGE
// ============================
let logs = [];

// ============================
// HOME
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// HEALTH
// ============================
app.get("/health", (req, res) => {
  res.json({
    status: "running",
    uptime: process.uptime(),
    logsStored: logs.length,
    timestamp: new Date().toISOString()
  });
});

// ============================
// GET LOGS
// ============================
app.get("/logs", (req, res) => {
  res.json(logs);
});

// ============================
// RECEIVE ESP32 DATA
// ============================
app.post("/api/data", (req, res) => {
  try {
    console.log("Incoming Request Body:", req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "No data received"
      });
    }

    const token = req.header("x-device-token");

    if (!token || token !== DEVICE_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized device"
      });
    }

    const data = {
      payload: req.body.payload || "",
      channel: req.body.channel || 0,
      rssi: Number(req.body.rssi || 0),
      snr: Number(req.body.snr || 0),
      selectedChannel: req.body.selectedChannel || "Unknown",
      role: req.body.role || "sender",
      time: new Date().toLocaleString()
    };

    // store latest first
    logs.unshift(data);

    // keep only last 200 records
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }

    console.log("Telemetry Received:");
    console.log(data);

    // send to dashboard
    io.emit("newMessage", data);

    return res.json({
      success: true,
      message: "Telemetry received"
    });

  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ============================
// SOCKET.IO
// ============================
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // send previous logs
  socket.emit("initialLogs", logs);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ============================
// START SERVER
// ============================
server.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Device Token: ${DEVICE_TOKEN}`);
  console.log("=================================");
});
