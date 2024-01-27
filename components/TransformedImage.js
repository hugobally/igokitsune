// TransformedImage.js
import React, { useEffect, useRef, useState } from 'react';

const transformParallelogramToSquare = (parallelogram) => {
  if (!parallelogram) return null;

  // Calculate the bounding box of the parallelogram
  const minX = Math.min(parallelogram.topLeft.x, parallelogram.topRight.x, parallelogram.bottomRight.x, parallelogram.bottomLeft.x);
  const minY = Math.min(parallelogram.topLeft.y, parallelogram.topRight.y, parallelogram.bottomRight.y, parallelogram.bottomLeft.y);
  const maxX = Math.max(parallelogram.topLeft.x, parallelogram.topRight.x, parallelogram.bottomRight.x, parallelogram.bottomLeft.x);
  const maxY = Math.max(parallelogram.topLeft.y, parallelogram.topRight.y, parallelogram.bottomRight.y, parallelogram.bottomLeft.y);

  // Calculate the side length of the square (longest side of the bounding box)
  const sideLength = Math.max(maxX - minX, maxY - minY);

  // Calculate the center of the parallelogram
  const centerX = (parallelogram.topLeft.x + parallelogram.topRight.x + parallelogram.bottomRight.x + parallelogram.bottomLeft.x) / 4;
  const centerY = (parallelogram.topLeft.y + parallelogram.topRight.y + parallelogram.bottomRight.y + parallelogram.bottomLeft.y) / 4;

  // Calculate the square with a side equal to the longest side of the bounding box
  const square = {
    topLeft: { x: centerX - sideLength / 2, y: centerY - sideLength / 2 },
    topRight: { x: centerX + sideLength / 2, y: centerY - sideLength / 2 },
    bottomRight: { x: centerX + sideLength / 2, y: centerY + sideLength / 2 },
    bottomLeft: { x: centerX - sideLength / 2, y: centerY + sideLength / 2 },
  };

  return square;
};

const TransformedImage = ({ webcamRef, parallelogram }) => {
  const canvasRef = useRef(null);
  const [square, setSquare] = useState(null);
  const [rectifiedImage, setRectifiedImage] = useState(null);

  useEffect(() => {
    const captureAndDrawFrame = async () => {
      const webcam = webcamRef.current;

      if (webcam) {
        const screenshot = await webcam.getScreenshot();
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const image = new Image();

        // Ensure the image is loaded before drawing
        image.onload = async () => {
          // Draw the new frame on top of existing content
          context.globalAlpha = 1; // Reset alpha
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Draw the parallelogram on the canvas
          context.globalAlpha = 0.5; // Set alpha for transparency
          context.strokeStyle = 'white'; // Set line color
          context.lineWidth = 2; // Set line width

          if (parallelogram) {
            const { topLeft, topRight, bottomRight, bottomLeft } = parallelogram;

            context.beginPath();
            context.moveTo(topLeft.x, topLeft.y);
            context.lineTo(topRight.x, topRight.y);
            context.lineTo(bottomRight.x, bottomRight.y);
            context.lineTo(bottomLeft.x, bottomLeft.y);
            context.closePath();
            context.stroke();

            // Transform the parallelogram into a square
            const square = transformParallelogramToSquare(parallelogram);
            setSquare(square);

            // Set text color to white
            context.fillStyle = 'white';

            const keys = Object.keys(parallelogram);
            keys.forEach((key) => {
              const point = parallelogram[key];

              // Display the key and coordinates next to each point
              context.fillText(`Key: ${key}`, point.x + 5, point.y - 5);
              context.fillText(`X: ${point.x.toFixed(2)}`, point.x + 5, point.y + 10);
              context.fillText(`Y: ${point.y.toFixed(2)}`, point.x + 5, point.y + 25);
            });

            // Draw the square on the canvas with a blue outline
            context.globalAlpha = 0.5; // Set alpha for transparency
            context.strokeStyle = 'blue'; // Set line color to blue
            context.lineWidth = 2; // Set line width
            context.beginPath();
            context.moveTo(square.topLeft.x, square.topLeft.y);
            context.lineTo(square.topRight.x, square.topRight.y);
            context.lineTo(square.bottomRight.x, square.bottomRight.y);
            context.lineTo(square.bottomLeft.x, square.bottomLeft.y);
            context.closePath();
            context.stroke();

            // Make API request to the server-side OpenCV processing
            const response = await fetch('/api/rectify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ parallelogram, square }),
            });

            const { rectifiedBase64 } = await response.json();
            setRectifiedImage(`data:image/jpeg;base64,${rectifiedBase64}`);
          }
        };

        image.src = screenshot;
      }
    };

    const intervalId = setInterval(captureAndDrawFrame, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [webcamRef, parallelogram]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Canvas for drawing parallelogram and square */}
      <canvas
        ref={canvasRef}
        width={640} // Set the width and height according to your requirements
        height={480}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, backgroundColor: 'transparent' }}
      />

      {rectifiedImage && (
        <img
          src={rectifiedImage}
          style={{ position: 'absolute', top: 480, left: 0, zIndex: 1, backgroundColor: 'transparent' }}
        />
      )}
    </div>
  );
};

export default TransformedImage;