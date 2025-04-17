import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';

const ImageRotator = () => {
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const rotateImage = (degrees) => {
    setRotation((prevRotation) => (prevRotation + degrees) % 360);
  };

  const saveImage = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;

    img.onload = () => {
      canvas.width = rotation % 180 === 0 ? img.width : img.height;
      canvas.height = rotation % 180 === 0 ? img.height : img.width;

      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        saveAs(blob, `rotated-image-${rotation}deg.jpg`);
      }, 'image/jpeg');
    };
  };

  return (
    <div className="image-rotator">
      <input
        type="file"
        accept="image/jpeg,image/png"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()}>
        Select Image
      </button>

      {image && (
        <div className="image-container">
          <img
            src={image}
            alt="Uploaded"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="controls">
            <button onClick={() => rotateImage(90)}>Rotate 90°</button>
            <button onClick={() => rotateImage(-90)}>Rotate -90°</button>
            <button onClick={saveImage}>Save Image</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageRotator;