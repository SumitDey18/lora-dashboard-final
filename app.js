const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let logs = [];

// ESP32 sends data here
app.post("/api/data", (req, res) => {

    const data = {
        payload: req.body.payload,
        channel: req.body.channel,
        rssi: req.body.rssi,
        snr: req.body.snr,
        selectedChannel: req.body.selectedChannel,
        time: new Date().toLocaleTimeString()
    };

    logs.unshift(data);

    io.emit("newMessage", data);

    console.log(data);

    res.json({
        success: true
    });

});

// Send old logs
app.get("/logs", (req, res) => {

    res.json(logs);

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`🚀 Server Running at http://localhost:${PORT}`);

});