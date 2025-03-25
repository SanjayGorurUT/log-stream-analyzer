const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8082;
const wss = new WebSocket.Server({ port: process.env.WSPORT || 8083 });

app.use(cors());
app.use(express.json());

// Simulated log levels
const levels = ["INFO", "WARN", "ERROR"];
const logs = [];

// WebSocket connection
wss.on("connection", (ws) => {
    console.log("Client connected");
    
    ws.send(JSON.stringify({ type: "INIT", logs }));

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);
        if (data.type === "FILTER") {
            const filteredLogs = logs.filter(log => log.level === data.level);
            ws.send(JSON.stringify({ type: "UPDATE", logs: filteredLogs }));
        }
    });
});

// Generate logs every 2 seconds
setInterval(() => {
    const newLog = {
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: `Log event at ${new Date().toISOString()}`
    };
    logs.push(newLog);
    
    // Broadcast log to all clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "NEW_LOG", log: newLog }));
        }
    });
}, 2000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));