import React, { useState } from 'react';
import SliderComponent from './components/SliderComponent';
import ImageRotator from './components/ImageRotator';
import FileDownloader from './components/FileDownloader';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('slider');

  return (
    <div className="App">
      <div className="tabs">
        <button onClick={() => setActiveTab('slider')}>Slider</button>
        <button onClick={() => setActiveTab('image')}>Image Rotator</button>
        <button onClick={() => setActiveTab('download')}>File Downloader</button>
      </div>

      {activeTab === 'slider' && <SliderComponent />}
      {activeTab === 'image' && <ImageRotator />}
      {activeTab === 'download' && <FileDownloader />}
    </div>
  );
}

export default App;