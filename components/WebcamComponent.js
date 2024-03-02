// WebcamComponent.js
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import TransformedImage from './TransformedImage';

const WebcamComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [inputVertices, setInputVertices] = useState([]);
  const [quadrilateral, setQuadrilateral] = useState(null);

  const [webcamLoaded, setWebcamLoaded] = useState(false)
  const [openCvLoaded, setOpenCvLoaded] = useState(false)

  useEffect(() => {
    if (openCvLoaded && webcamLoaded) {
      const storedVertices = JSON.parse(localStorage.getItem('inputVertices')) || [];
      setInputVertices(storedVertices);
    }
  }, [webcamLoaded, openCvLoaded]);

  useEffect(() => {
    if (window.openCvLoading) return ;
    window.openCvLoading = true;

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js'
    script.async = true;
    script.onload = () => {
      window.openCvLoading = false;
      setOpenCvLoaded(true)
    };
    script.onerror = () => {
      console.error('Error loading script.');
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a small white circle around each clicked vertex
    inputVertices.forEach((vertex) => {
      context.fillStyle = 'white';
      context.fillRect(vertex.x, vertex.y, 3, 3);
    });
  }, [inputVertices, quadrilateral]);

  const handleClick = (event) => {
    if (!openCvLoaded) return null

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.nativeEvent.offsetX * (canvas.width / rect.width);
    const y = event.nativeEvent.offsetY * (canvas.height / rect.height);

    if (inputVertices.length === 4) {
      setInputVertices([{ x, y }]);
      setQuadrilateral(null);
    } else {
      setInputVertices((prevVertices) => [...prevVertices, { x, y }]);
    }
  };

  useEffect(() => {
    if (inputVertices.length === 4) {
      const sortVerticesClockwise = (vertices) => {
        const center = {
          x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
          y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length,
        };

        return vertices.slice().sort((a, b) => {
          const angleA = Math.atan2(a.y - center.y, a.x - center.x);
          const angleB = Math.atan2(b.y - center.y, b.x - center.x);
          return angleA - angleB;
        });
      };

      const vertices = sortVerticesClockwise(inputVertices)

      setQuadrilateral({
        topLeft: vertices[0],
        topRight: vertices[1],
        bottomRight: vertices[2],
        bottomLeft: vertices[3],
      });

      localStorage.setItem('inputVertices', JSON.stringify(inputVertices));
    }
  }, [inputVertices]);

  return (
    <div className="flex flex-col">
      <div style={{ position: 'relative' }}>
        <Webcam
          ref={webcamRef}
          onUserMedia={() => setWebcamLoaded(true)}
          width={640}
          height={480}
          className="pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          width={640}
          height={480}
          className="absolute top-0 left-0"
          style={{ zIndex: 1 }}
        />
      </div>

      {inputVertices.length === 4 && (
        <TransformedImage
          webcamRef={webcamRef}
          quadrilateral={quadrilateral}
        />
      )}
    </div>
  );
};

export default WebcamComponent;

