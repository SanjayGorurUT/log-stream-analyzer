const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8082;
const wss = new WebSocket.Server({ port: process.env.WSPORT || 8083 });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send({ message: "WebSocket server is running", port: PORT, status: 200 });
});

app.get("/logs", (req, res) => {
    if(allLogs.length == 0) {
        res.status(404).send({ message: "No logs found", status: 404 });
    }
    res.status(200).send(allLogs);
}); 

app.post("/log", (req, res) => {
    const logRecord = req.body.json();
    if(!logRecord.timestamp) {
        res.status(400).send({ message: "Log record must include timestamp", status: 400 });
    }
    res.status(204).send({ message: "Log record created", status: 204 });
});

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
// This should call server API to update logs
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