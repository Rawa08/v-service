const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
