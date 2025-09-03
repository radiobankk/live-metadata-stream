const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

app.get('/stream.mp3', (req, res) => {
res.setHeader('Content-Type', 'audio/mpeg');

ffmpeg('https://dvrfl03.bozztv.com/hondu-cbsorlando/index.m3u8')
.inputOptions('-reconnect', '1')
.inputOptions('-reconnect_streamed', '1')
.inputOptions('-reconnect_delay_max', '2')
.format('mp3')
.audioCodec('libmp3lame')
.outputOptions('-id3v2_version', '3')
.on('error', err => {
console.error('FFmpeg error:', err.message);
res.end();
})
.pipe(res, { end: true });
});

app.listen(3000, () => {
console.log('🎧 Live audio stream at http://localhost:3000/stream.mp3');
});