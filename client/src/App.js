// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleProcess = async () => {
    if (!videoFile || !audioFile) {
      alert('Please select both a video file and an audio file.');
      return;
    }
    setProcessing(true);
    setServerResponse(null);
  
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('audio', audioFile);
  
    try {
      const res = await axios.post('/api/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setServerResponse(res.data);
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pelvic Floor Pro Video & Audio Selector</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Video File:</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Audio File:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleProcess}
        disabled={processing}
        className={`mt-4 px-4 py-2 font-semibold text-sm text-white rounded-lg shadow-md ${
          processing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
        }`}
      >
        {processing ? 'Processing...' : 'Process'}
      </button>

      {serverResponse && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-green-600">Success!</h3>
          <p className="text-gray-700">{serverResponse.message}</p>

          {serverResponse.videoUrl && (
            <div className="mt-4">
              <video
                src={`https://tranquil-hollows-65929-d05e0a5022ea.herokuapp.com${serverResponse.videoUrl}`}
                controls
                width="400"
                className="mx-auto"
              />
              <a
                href={`https://tranquil-hollows-65929-d05e0a5022ea.herokuapp.com/${serverResponse.videoUrl}`}
                download
                className="block mt-2 text-blue-500 hover:underline"
              >
                Download Video
              </a>
            </div>
          )}

          {serverResponse.thumbnailUrl && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-700">Thumbnail</h4>
              <img
                src={`https://tranquil-hollows-65929-d05e0a5022ea.herokuapp.com${serverResponse.thumbnailUrl}`}
                alt="Thumbnail"
                className="w-48 mx-auto"
              />
              <a
                href={`https://tranquil-hollows-65929-d05e0a5022ea.herokuapp.com/${serverResponse.thumbnailUrl}`}
                download
                className="block mt-2 text-blue-500 hover:underline"
              >
                Download Thumbnail
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;