// server/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { replaceVideoAudio2, createThumbnail } = require('./videoUtils');

// Create an uploads directory if it doesn’t exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename based on date + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors()); // Allow requests from React dev server

// Endpoint: upload video + audio, process them
app.post('/api/process', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    console.log(req.body)
  try {
    // Check if files exist
    if (!req.files.video || !req.files.audio) {
      return res.status(400).json({ error: 'Video or audio file missing' });
    }

    const videoFile = req.files.video[0];
    const audioFile = req.files.audio[0];

    // Where we’ll save the final processed file
    // e.g., same folder as uploads, named "processed-<timestamp>.mp4"
    const outputFilename = `processed-${Date.now()}.mp4`;
    const outputPath = path.join(UPLOADS_DIR, outputFilename);

    // 1) Replace audio
    await replaceVideoAudio2(videoFile.path, audioFile.path, outputPath);

    // 2) Create thumbnail
    const thumbnailPath = await createThumbnail(outputPath);

    // Return success + URLs or paths
    // In a real app, you might store them on S3, or serve them with a static route
    res.json({
      success: true,
      message: 'Video processed successfully',
      videoUrl: `/uploads/${outputFilename}`,
      thumbnailUrl: `/uploads/${path.basename(thumbnailPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Serve the uploads folder statically so we can preview or download
app.use('/uploads', express.static(UPLOADS_DIR));

// Start the server
const PORT = process.env.PORT || 5001; // Change from 5000 to 5001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});