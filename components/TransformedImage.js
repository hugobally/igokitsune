// TransformedImage.js
import React, { useEffect, useRef, useState } from 'react';

const transformQuadrilateralToSquare = (quadrilateral) => {
  if (!quadrilateral) return null;

  // Calculate the bounding box of the quadrilateral
  const minX = Math.min(quadrilateral.topLeft.x, quadrilateral.topRight.x, quadrilateral.bottomRight.x, quadrilateral.bottomLeft.x);
  const minY = Math.min(quadrilateral.topLeft.y, quadrilateral.topRight.y, quadrilateral.bottomRight.y, quadrilateral.bottomLeft.y);
  const maxX = Math.max(quadrilateral.topLeft.x, quadrilateral.topRight.x, quadrilateral.bottomRight.x, quadrilateral.bottomLeft.x);
  const maxY = Math.max(quadrilateral.topLeft.y, quadrilateral.topRight.y, quadrilateral.bottomRight.y, quadrilateral.bottomLeft.y);

  // Calculate the side length of the square (longest side of the bounding box)
  const sideLength = Math.max(maxX - minX, maxY - minY);

  // Calculate the center of the quadrilateral
  const centerX = (quadrilateral.topLeft.x + quadrilateral.topRight.x + quadrilateral.bottomRight.x + quadrilateral.bottomLeft.x) / 4;
  const centerY = (quadrilateral.topLeft.y + quadrilateral.topRight.y + quadrilateral.bottomRight.y + quadrilateral.bottomLeft.y) / 4;

  // Calculate the square with a side equal to the longest side of the bounding box
  const square = {
    topLeft: { x: centerX - sideLength / 2, y: centerY - sideLength / 2 },
    topRight: { x: centerX + sideLength / 2, y: centerY - sideLength / 2 },
    bottomRight: { x: centerX + sideLength / 2, y: centerY + sideLength / 2 },
    bottomLeft: { x: centerX - sideLength / 2, y: centerY + sideLength / 2 },
  };

  return square;
};

const TransformedImage = ({ webcamRef, quadrilateral }) => {
  // const canvasRef = useRef(null);
  const rectifiedCanvasRef = useRef(null);

  const [frozenScreenshot, setFrozenScreenshot] = useState(null)
  const [processing, setProcessing] = useState(false)

  const getScreenshot = async (webcam) => {
    const screenshot = await webcam.getScreenshot()
    setFrozenScreenshot(screenshot)
  }

  useEffect(() => {
    const captureAndDrawFrame = async () => {
      const webcam = webcamRef.current;

      if (webcam && !frozenScreenshot) {
        getScreenshot(webcam)
      }

      if (frozenScreenshot && !processing) {
        setProcessing(true)
        const screenshot = frozenScreenshot
        // const canvas = canvasRef.current;
        const rectifiedCanvas = rectifiedCanvasRef.current; // New canvas element
        // const context = canvas.getContext('2d');
        const rectifiedContext = rectifiedCanvas.getContext('2d'); // New context for rectified image

        const image = new Image();

        // Ensure the image is loaded before drawing
        image.onload = async () => {
          // Draw the new frame on top of existing content
          // context.globalAlpha = 1; // Reset alpha
          // context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Draw the quadrilateral on the canvas
          // context.globalAlpha = 0.5; // Set alpha for transparency
          // context.strokeStyle = 'white'; // Set line color
          // context.lineWidth = 2; // Set line width

          if (quadrilateral) {
            const { topLeft, topRight, bottomRight, bottomLeft } = quadrilateral;

            // context.beginPath();
            // context.moveTo(topLeft.x, topLeft.y);
            // context.lineTo(topRight.x, topRight.y);
            // context.lineTo(bottomRight.x, bottomRight.y);
            // context.lineTo(bottomLeft.x, bottomLeft.y);
            // context.closePath();
            // context.stroke();

            // Transform the quadrilateral into a square
            const square = transformQuadrilateralToSquare(quadrilateral);

            // Set text color to white
            // context.fillStyle = 'white';
            //
            // const keys = Object.keys(quadrilateral);
            // keys.forEach((key) => {
            //   const point = quadrilateral[key];
            //
            //   // Display the key and coordinates next to each point
            //   context.fillText(`Key: ${key}`, point.x + 5, point.y - 5);
            //   context.fillText(`X: ${point.x.toFixed(2)}`, point.x + 5, point.y + 10);
            //   context.fillText(`Y: ${point.y.toFixed(2)}`, point.x + 5, point.y + 25);
            // });
            //
            // // Draw the square on the canvas with a blue outline
            // context.globalAlpha = 0.5; // Set alpha for transparency
            // context.strokeStyle = 'blue'; // Set line color to blue
            // context.lineWidth = 2; // Set line width
            // context.beginPath();
            // context.moveTo(square.topLeft.x, square.topLeft.y);
            // context.lineTo(square.topRight.x, square.topRight.y);
            // context.lineTo(square.bottomRight.x, square.bottomRight.y);
            // context.lineTo(square.bottomLeft.x, square.bottomLeft.y);
            // context.closePath();
            // context.stroke();

            // Convert screenshot, quadrilateral, and square to OpenCV Mats

            const base64toImgData = (base64Image) => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function () {
                  const canvas = document.createElement("canvas");

                  canvas.width = img.width;
                  canvas.height = img.height;

                  const context = canvas.getContext("2d");

                  context.drawImage(img, 0, 0);

                  const imageData = context.getImageData(0, 0, img.width, img.height);

                  resolve(imageData)
                };
                img.src = base64Image;
                img.onerror = reject
              })
            }

            const screenshotMat = cv.matFromImageData(await base64toImgData(screenshot));
            const quadrilateralMat = new cv.Mat(4, 1, cv.CV_32FC2);
            const squareMat = new cv.Mat(4, 1, cv.CV_32FC2);

            // // Set the values for quadrilateral and square Mats
            const quadrilateralKeys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
            const squareKeys = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

            quadrilateralKeys.forEach((key, i) => {
              quadrilateralMat.data32F[i * 2] = quadrilateral[key].x;
              quadrilateralMat.data32F[i * 2 + 1] = quadrilateral[key].y;

              squareMat.data32F[i * 2] = square[key].x;
              squareMat.data32F[i * 2 + 1] = square[key].y;
            });
            //
            // // Get the perspective transform matrix
            const matrix = cv.getPerspectiveTransform(quadrilateralMat, squareMat);

            // // Perform warp perspective
            const rectifiedMat = new cv.Mat();
            cv.warpPerspective(screenshotMat, rectifiedMat, matrix, new cv.Size(screenshotMat.cols, screenshotMat.rows));

            //
            // // draw the rectified image on a canvas
            const rectifiedImageData = new ImageData(
              new Uint8ClampedArray(rectifiedMat.data),
              rectifiedMat.cols,
              rectifiedMat.rows
            );
            rectifiedCanvas.width = rectifiedMat.cols;
            rectifiedCanvas.height = rectifiedMat.rows;
            rectifiedContext.putImageData(rectifiedImageData, 0, 0);

            // draw corners on the canvas
            const transformedCorners = new cv.Mat();
            cv.perspectiveTransform(quadrilateralMat, transformedCorners, matrix);

            rectifiedContext.fillStyle = 'white';
            for (let i = 0; i < transformedCorners.rows; i++) {
              const x = transformedCorners.data32F[i * 2];
              const y = transformedCorners.data32F[i * 2 + 1];
              rectifiedContext.beginPath();
              rectifiedContext.arc(x, y, 3, 0, 2 * Math.PI);
              rectifiedContext.fill();
            }

            const transformedQuadrilateral = {};
            const keyOrder = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];  // Define the correct order of corners
            keyOrder.forEach((key, i) => {
              transformedQuadrilateral[key] = {
                x: transformedCorners.data32F[i * 2],
                y: transformedCorners.data32F[i * 2 + 1],
              };
            });

            const drawGrid = (quadrilateral, context) => {
              const { topLeft, topRight, bottomLeft, bottomRight } = quadrilateral;

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

            drawGrid(transformedQuadrilateral, rectifiedContext)

            // // Release Mats
            screenshotMat.delete();
            quadrilateralMat.delete();
            squareMat.delete();
            rectifiedMat.delete();

            setFrozenScreenshot(null)
            setProcessing(false)
          }
        };

        image.src = screenshot;
      }
    };

    const intervalId = setInterval(captureAndDrawFrame, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [processing, frozenScreenshot, webcamRef, quadrilateral]);

  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      {/*<canvas*/}
      {/*  ref={canvasRef}*/}
      {/*  width={640}*/}
      {/*  height={480}*/}
      {/*  style={{*/}
      {/*    position: 'absolute',*/}
      {/*    top: 0,*/}
      {/*    left: 0,*/}
      {/*    zIndex: 2,*/}
      {/*    backgroundColor: 'transparent'*/}
      {/*  }}*/}
      {/*/>*/}
      <canvas
        ref={rectifiedCanvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
};

export default TransformedImage;