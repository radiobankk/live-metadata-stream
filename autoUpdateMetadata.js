const fs = require('fs');
const path = require('path');
const schedule = require('./schedule');

// Force Eastern Time (EDT/EST)
process.env.TZ = 'America/New_York';

// Get current time in "HH:MM" 24-hour format
const now = new Date();
const timeStr = now.toTimeString().slice(0, 5); // e.g., "18:06"

// Match current time to schedule
function getCurrentShow(schedule, timeStr) {
for (const show of schedule) {
if (timeStr >= show.start && timeStr < show.end) {
return show.title;
}
}
return "Off Air";
}

const currentShow = getCurrentShow(schedule, timeStr);
const metadata = { title: currentShow };

// Write to metadata.json
const metadataPath = path.join(__dirname, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log(`[${now.toLocaleString()}] Metadata updated: ${metadata.title}`);
