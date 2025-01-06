// server/videoUtils.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// If you installed ffmpeg-static, you can link it so fluent-ffmpeg uses it:
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Replace the audio of a video with a new audio track.
 * @param {string} inputVideoPath Path to the original video file
 * @param {string} newAudioPath   Path to the new audio file
 * @param {string} outputPath     Where to save the final video
 * @returns {Promise<void>}
 */
function replaceVideoAudio2(inputVideoPath, newAudioPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputVideoPath)
      .input(newAudioPath)
      .outputOptions([
        '-map 0:v:0',     // take the video from input 0
        '-map 1:a:0',     // take the audio from input 1
        '-c:v copy',      // do not re-encode video
        '-c:a aac',       // encode audio to AAC
        '-shortest'       // stop when the shortest input ends
      ])
      .on('error', (err) => {
        console.error('Error replacing audio:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Video processing finished:', outputPath);
        resolve();
      })
      .save(outputPath);
  });
}

/**
 * Create a thumbnail from a given video at ~10 seconds, resized to 405x225.
 * @param {string} videoPath Path to the video
 * @returns {Promise<string>} Path to the created thumbnail
 */
function createThumbnail(videoPath) {
  return new Promise((resolve, reject) => {
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const outputDir = path.dirname(videoPath);
    const thumbnailPath = path.join(outputDir, `${baseName}_thumbnail.jpg`);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [10],         // at 10 seconds
        filename: `${baseName}_thumbnail.jpg`,
        folder: outputDir,
        size: '405x225'
      })
      .on('end', () => {
        console.log('Thumbnail created:', thumbnailPath);
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        console.error('Error creating thumbnail:', err);
        reject(err);
      });
  });
}

module.exports = {
  replaceVideoAudio2,
  createThumbnail
};