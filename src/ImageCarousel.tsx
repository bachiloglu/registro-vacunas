import React, { useState } from 'react';
import './ImageCarousel.css';

interface ImageCarouselProps {
  images: string[];
  onClose: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `Imagen_${currentIndex + 1}`;
    link.click();
  };

  return (
    <div className="image-carousel-overlay" onClick={onClose}>
      <div className="image-carousel" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="carousel-content">
          <button className="carousel-button prev" onClick={handlePrevClick}>‹</button>
          <img src={images[currentIndex]} alt={`Imagen ${currentIndex + 1}`} className="carousel-image" />
          <button className="carousel-button next" onClick={handleNextClick}>›</button>
        </div>
        <button className="download-button" onClick={handleDownloadClick}>Descargar imagen</button>
      </div>
    </div>
  );
};

export default ImageCarousel;
