const express = require("express");
const { PassThrough } = require("stream");
const { spawn } = require("child_process");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const streamUrl = "http://208.89.99.124:5004/auto/v6.1";
const sessionId = crypto.randomUUID();
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const traceLabel = `WKMG-Session-${sessionId}-${timestamp}`;

console.log(`🧠 Starting WKMG stream trace: ${traceLabel}`);

let audioStream = new PassThrough();
let activeClients = 0;

// 🎧 FFmpeg pipeline with WKMG branding
const ffmpegProcess = spawn("ffmpeg", [
"-re",
"-timeout", "5000000",
"-rw_timeout", "15000000",
"-loglevel", "verbose",
"-i", streamUrl,
"-vn",
"-c:a", "libmp3lame",
"-b:a", "192k",
"-f", "mp3",
"-metadata", "title=WKMG-DT1 NEWS 6",
"-metadata", "artist=WKMG-DT1 NEWS 6",
"-metadata", "album=WKMG-DT1 NEWS 6",
"-metadata", "comment=Live MP3 Relay / 192K",
"pipe:1"
]);

ffmpegProcess.stdout.pipe(audioStream, { end: false });

ffmpegProcess.stderr.on("data", data => {
console.log(`📣 [${traceLabel}] FFmpeg stderr:`, data.toString());
});

ffmpegProcess.on("close", code => {
console.log(`❌ [${traceLabel}] FFmpeg exited with code ${code}`);
});

// 🔊 WKMG stream endpoint
app.get("/stream-wkmg.mp3", (req, res) => {
const clientId = crypto.randomUUID();
activeClients++;
console.log(`🔗 [${traceLabel}] Client connected: ${req.ip} | ID: ${clientId}`);
console.log(`👥 Active clients: ${activeClients}`);

res.writeHead(200, {
"Content-Type": "audio/mpeg",
"Transfer-Encoding": "chunked",
"Connection": "keep-alive"
});

audioStream.pipe(res);

req.on("close", () => {
activeClients--;
console.log(`❌ [${traceLabel}] Client disconnected: ${req.ip} | ID: ${clientId}`);
console.log(`👥 Active clients: ${activeClients}`);
});
});

// 🛡️ Health check
app.get("/health", (req, res) => {
res.status(200).send("OK");
});

// 📊 Metadata endpoint
app.get("/metadata", (req, res) => {
res.json({
title: "WKMG-DT1 NEWS 6",
artist: "WKMG-DT1 NEWS 6",
album: "WKMG-DT1 NEWS 6",
comment: "Live MP3 Relay / 192K",
source: streamUrl,
session: traceLabel,
timestamp: new Date().toISOString(),
activeClients
});
});

// 🧼 Graceful shutdown
process.on("SIGINT", () => {
console.log(`🛑 [${traceLabel}] SIGINT received. Shutting down...`);
audioStream.end();
process.exit();
});

process.on("SIGTERM", () => {
console.log(`🛑 [${traceLabel}] SIGTERM received. Terminating...`);
audioStream.end();
process.exit();
});

app.listen(PORT, () => {
console.log(`🎧 WKMG-DT1 MP3 stream available at http://localhost:3000/stream-wkmg.mp3`);
});