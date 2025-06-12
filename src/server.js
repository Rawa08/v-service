const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const playlistDataPath = path.join(__dirname, 'data', 'playlist.json');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const registryFilePath = path.join(__dirname, 'deviceRegistry.json');

// Hjälpfunktion för att läsa deviceRegistry från fil
function readDeviceRegistry() {
  try {
    const data = fs.readFileSync(registryFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading device registry:', err);
    return {};
  }
}

// Hjälpfunktion för att skriva till deviceRegistry-filen
function writeDeviceRegistry(data) {
  try {
    fs.writeFileSync(registryFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to device registry:', err);
  }
}

app.post('/api/register-device', (req, res) => {
  const { androidId } = req.body;
  console.log(`Id requested for ${androidId}`);

  if (!androidId) {
    return res.status(400).json({ error: 'androidId is required' });
  }

  const deviceRegistry = readDeviceRegistry();

  if (deviceRegistry[androidId]) {
    return res.json({ deviceId: deviceRegistry[androidId] });
  }

  const deviceId = uuidv4();
  deviceRegistry[androidId] = deviceId;
  writeDeviceRegistry(deviceRegistry);

  return res.json({ deviceId });
});

app.get('/api/get-playlists/:deviceId', (req, res) => {
  const { deviceId } = req.params;

  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required' });
  }

  try {
    const rawData = fs.readFileSync(playlistDataPath, 'utf8');
    const playlists = JSON.parse(rawData);

   
    return res.json({config: {},playlists});
  } catch (err) {
    console.error('Error reading playlist data:', err);
    return res.status(500).json({ error: 'Could not read playlist data' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
