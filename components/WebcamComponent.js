// WebcamComponent.js
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import TransformedImage from './TransformedImage';

const WebcamComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [inputVertices, setInputVertices] = useState([]);
  const [parallelogram, setParallelogram] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a small white circle around each clicked vertex
    inputVertices.forEach((vertex) => {
      context.fillStyle = 'white';
      context.fillRect(vertex.x, vertex.y, 1, 1);
    });

    if (parallelogram) {
      // Draw the grid using the four corners and sides of the parallelogram
      const { topLeft, topRight, bottomLeft, bottomRight } = parallelogram;

      const horizontalLines = 19;
      const verticalLines = 19;

      const deltaXTop = (topRight.x - topLeft.x) / (verticalLines - 1);
      const deltaYTop = (topRight.y - topLeft.y) / (verticalLines - 1);

      const deltaXBottom = (bottomRight.x - bottomLeft.x) / (verticalLines - 1);
      const deltaYBottom = (bottomRight.y - bottomLeft.y) / (verticalLines - 1);

      for (let i = 0; i < verticalLines; i++) {
        const xTop = topLeft.x + i * deltaXTop;
        const yTop = topLeft.y + i * deltaYTop;

        const xBottom = bottomLeft.x + i * deltaXBottom;
        const yBottom = bottomLeft.y + i * deltaYBottom;

        context.beginPath();
        context.moveTo(xTop, yTop);
        context.lineTo(xBottom, yBottom);
        context.strokeStyle = 'white';
        context.stroke();
      }

      const deltaXLeft = (bottomLeft.x - topLeft.x) / (horizontalLines - 1);
      const deltaYLeft = (bottomLeft.y - topLeft.y) / (horizontalLines - 1);

      const deltaXRight = (bottomRight.x - topRight.x) / (horizontalLines - 1);
      const deltaYRight = (bottomRight.y - topRight.y) / (horizontalLines - 1);

      for (let i = 0; i < horizontalLines; i++) {
        const xLeft = topLeft.x + i * deltaXLeft;
        const yLeft = topLeft.y + i * deltaYLeft;

        const xRight = topRight.x + i * deltaXRight;
        const yRight = topRight.y + i * deltaYRight;

        context.beginPath();
        context.moveTo(xLeft, yLeft);
        context.lineTo(xRight, yRight);
        context.strokeStyle = 'white';
        context.stroke();
      }
    }
  }, [inputVertices, parallelogram]);

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.nativeEvent.offsetX * (canvas.width / rect.width);
    const y = event.nativeEvent.offsetY * (canvas.height / rect.height);

    if (inputVertices.length === 4) {
      setInputVertices([{ x, y }]);
      setParallelogram(null);
    } else {
      setInputVertices((prevVertices) => [...prevVertices, { x, y }]);
    }
  };

  useEffect(() => {
    if (inputVertices.length === 4) {
      const topLeft = inputVertices.reduce((min, p) => (p.x + p.y < min.x + min.y ? p : min), inputVertices[0]);
      const topRight = inputVertices.reduce((min, p) => (p.x - p.y > min.x - min.y ? p : min), inputVertices[0]);
      const bottomLeft = inputVertices.reduce((min, p) => (p.x - p.y < min.x - min.y ? p : min), inputVertices[0]);
      const bottomRight = inputVertices.reduce((min, p) => (p.x + p.y > min.x + min.y ? p : min), inputVertices[0]);

      setParallelogram({
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
      });
    }
  }, [inputVertices]);

  return (
    <div className="relative">
      <div style={{ position: 'relative' }}>
        <Webcam
          ref={webcamRef}
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
          parallelogram={parallelogram}
        />
      )}
    </div>
  );
};

export default WebcamComponent;

