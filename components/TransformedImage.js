import React, { useEffect, useRef, useState } from 'react';
import GobanSourceImage from '@/components/GobanSourceImage'
import DisplayDebug from '@/components/DisplayDebug'

const transformQuadrilateralToSquare = (quadrilateral) => {
  if (!quadrilateral) return null;

  const minX = Math.min(quadrilateral.topLeft.x, quadrilateral.topRight.x, quadrilateral.bottomRight.x, quadrilateral.bottomLeft.x);
  const minY = Math.min(quadrilateral.topLeft.y, quadrilateral.topRight.y, quadrilateral.bottomRight.y, quadrilateral.bottomLeft.y);
  const maxX = Math.max(quadrilateral.topLeft.x, quadrilateral.topRight.x, quadrilateral.bottomRight.x, quadrilateral.bottomLeft.x);
  const maxY = Math.max(quadrilateral.topLeft.y, quadrilateral.topRight.y, quadrilateral.bottomRight.y, quadrilateral.bottomLeft.y);

  const sideLength = Math.max(maxX - minX, maxY - minY);

  const centerX = (quadrilateral.topLeft.x + quadrilateral.topRight.x + quadrilateral.bottomRight.x + quadrilateral.bottomLeft.x) / 4;
  const centerY = (quadrilateral.topLeft.y + quadrilateral.topRight.y + quadrilateral.bottomRight.y + quadrilateral.bottomLeft.y) / 4;

  const square = {
    topLeft: { x: centerX - sideLength / 2, y: centerY - sideLength / 2 },
    topRight: { x: centerX + sideLength / 2, y: centerY - sideLength / 2 },
    bottomRight: { x: centerX + sideLength / 2, y: centerY + sideLength / 2 },
    bottomLeft: { x: centerX - sideLength / 2, y: centerY + sideLength / 2 },
  };

  return square;
};

const TransformedImage = ({ webcamRef, quadrilateral }) => {
  const rectifiedCanvasRef = useRef(null);

  const [frozenScreenshot, setFrozenScreenshot] = useState(null)
  const [processing, setProcessing] = useState(false)

  const [debugPoints, setDebugPoints] = useState([])

  const [debugStopOnFirstScreenshot, setDebugStopOnFirstScreenshot] = useState(false)

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

      if (frozenScreenshot && !processing && !debugStopOnFirstScreenshot) {
        setProcessing(true)

        setDebugStopOnFirstScreenshot(false)

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

            const square = transformQuadrilateralToSquare(quadrilateral);

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

            const matrix = cv.getPerspectiveTransform(quadrilateralMat, squareMat);

            const rectifiedMat = new cv.Mat();
            cv.warpPerspective(screenshotMat, rectifiedMat, matrix, new cv.Size(screenshotMat.cols, screenshotMat.rows));

            const rectifiedImageData = new ImageData(
              new Uint8ClampedArray(rectifiedMat.data),
              rectifiedMat.cols,
              rectifiedMat.rows
            );
            rectifiedCanvas.width = rectifiedMat.cols;
            rectifiedCanvas.height = rectifiedMat.rows;
            rectifiedContext.putImageData(rectifiedImageData, 0, 0);

            const transformedCorners = new cv.Mat();
            cv.perspectiveTransform(quadrilateralMat, transformedCorners, matrix);

            const transformedQuadrilateral = {};
            const keyOrder = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];  // Define the correct order of corners
            keyOrder.forEach((key, i) => {
              transformedQuadrilateral[key] = {
                x: transformedCorners.data32F[i * 2],
                y: transformedCorners.data32F[i * 2 + 1],
              };
            });

            const grayMat = new cv.Mat();
            cv.cvtColor(rectifiedMat, grayMat, cv.COLOR_RGBA2GRAY);

            const gobanImage = new GobanSourceImage(grayMat, transformedQuadrilateral, 19)
            setDebugPoints(gobanImage.findStones())
            grayMat.delete();

            // START CROP STUFF
            // const findDistance = (point1, point2) => {
            //   const dx = point1.x - point2.x;
            //   const dy = point1.y - point2.y;
            //   return Math.sqrt(dx * dx + dy * dy);
            // };
            //
            // const findLongestSide = (quadrilateral) => {
            //   const side1 = findDistance(quadrilateral.topLeft, quadrilateral.topRight);
            //   const side2 = findDistance(quadrilateral.topRight, quadrilateral.bottomRight);
            //   const side3 = findDistance(quadrilateral.bottomRight, quadrilateral.bottomLeft);
            //   const side4 = findDistance(quadrilateral.bottomLeft, quadrilateral.topLeft);
            //
            //   return Math.max(side1, side2, side3, side4);
            // };
            //
            // const calculateCroppingOrigin = (quadrilateral) => {
            //   const longestSide = findLongestSide(quadrilateral);
            //
            //   const croppingOrigin = {
            //     x: quadrilateral.topLeft.x - (longestSide / 18),
            //     y: quadrilateral.topLeft.y - (longestSide / 18),
            //   };
            //
            //   return croppingOrigin;
            // };
            //
            // const longestSide = findLongestSide(transformedQuadrilateral);
            // const croppingOrigin = calculateCroppingOrigin(transformedQuadrilateral, longestSide);
            // const croppingSize = longestSide + (1 / 9) * longestSide
            //
            // Define the region (example coordinates)
            // const regionX = croppingOrigin.x;
            // const regionY = croppingOrigin.y;
            // const regionWidth = croppingSize;
            // const regionHeight = croppingSize;

            // Extract the specified region from the original Mat
            // const regionMat = new cv.Mat()

            // const roiRect = new cv.Rect(regionX, regionY, regionWidth, regionHeight)
            //
            // const regionMat = rectifiedMat.roi(roiRect).clone();

            // cv.rectangle(regionMat, new cv.Point(regionX, regionY), new cv.Point(regionX + regionWidth, regionY + regionHeight), new cv.Scalar(0, 255, 0), 2)
            // rectifiedMat.roi(null)

            // Scale the ROI to a new size
            // const scaledWidth = 600; // Specify the desired width
            // const scaledHeight = (regionHeight / regionWidth) * scaledWidth; // Maintain aspect ratio
            // const scaledRegionMat = new cv.Mat();
            // cv.resize(regionMat, scaledRegionMat, new cv.Size(scaledWidth, scaledHeight), 0, 0, cv.INTER_AREA);
            //
            // cv.imshow(rectifiedCanvasRef.current, scaledRegionMat)
            // regionMat.delete()
            //
            // END CROP STUFF

            rectifiedContext.fillStyle = 'white';
            for (let i = 0; i < transformedCorners.rows; i++) {
              const x = transformedCorners.data32F[i * 2];
              const y = transformedCorners.data32F[i * 2 + 1];
              rectifiedContext.beginPath();
              rectifiedContext.arc(x, y, 3, 0, 2 * Math.PI);
              rectifiedContext.fill();
            }

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
    <>
      <div style={{position: 'relative', display: 'inline-block'}}>
        <canvas
          ref={rectifiedCanvasRef}
          width={640}
          height={480}
          style={{
            // position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: 'transparent'
          }}
        />
      </div>
      <DisplayDebug points={debugPoints}></DisplayDebug>
    </>
  );
};

export default TransformedImage;