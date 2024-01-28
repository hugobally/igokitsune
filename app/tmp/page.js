'use client'

import { useEffect, useRef, useState } from 'react'

// We'll limit the processing size to 200px.
const maxVideoSize = 200

/**
 * What we're going to render is:
 *
 * 1. A video component so the user can see what's on the camera.
 *
 * 2. A button to generate an image of the video, load OpenCV and
 * process the image.
 *
 * 3. A canvas to allow us to capture the image of the video and
 * show it to the user.
 */
export default function Page() {
  const [processing, updateProcessing] = useState(false)
  const videoElement = useRef(null)
  const canvasEl = useRef(null)

  const [openCvLoaded, setOpenCvLoaded] = useState(false)

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

  function imageProcessing(image) {
    const img = cv.matFromImageData(image)
    let result = new cv.Mat()

    // This converts the image to a greyscale.
    cv.cvtColor(img, result, cv.COLOR_BGR2GRAY)
    return imageDataFromMat(result)
  }

  /**
   * This function converts again from cv.Mat to ImageData
   */
  function imageDataFromMat(mat) {
    // converts the mat type to cv.CV_8U
    const img = new cv.Mat()
    const depth = mat.type() % 8
    const scale =
      depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0
    const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0
    mat.convertTo(img, cv.CV_8U, scale, shift)

    // converts the img type to cv.CV_8UC4
    switch (img.type()) {
      case cv.CV_8UC1:
        cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA)
        break
      case cv.CV_8UC3:
        cv.cvtColor(img, img, cv.COLOR_RGB2RGBA)
        break
      case cv.CV_8UC4:
        break
      default:
        throw new Error(
          'Bad number of channels (Source image must have 1, 3 or 4 channels)'
        )
    }
    const clampedArray = new ImageData(
      new Uint8ClampedArray(img.data),
      img.cols,
      img.rows
    )
    img.delete()
    return clampedArray
  }

  /**
   * In the onClick event we'll capture a frame within
   * the video to pass it to our service.
   */
  async function onClick() {
    updateProcessing(true)

    const ctx = canvasEl.current.getContext('2d')
    ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize)
    const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize)

    // Processing image
    const processedImage = await imageProcessing(image)
    // Render the processed image to the canvas
    ctx.putImageData(processedImage, 0, 0)
    updateProcessing(false)
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    async function initCamara() {
      videoElement.current.width = maxVideoSize
      videoElement.current.height = maxVideoSize

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        })
        videoElement.current.srcObject = stream

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current)
          }
        })
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera'
      alert(errorMessage)
      return Promise.reject(errorMessage)
    }

    async function load() {
      const videoLoaded = await initCamara()
      videoLoaded.play()
      return videoLoaded
    }

    load()
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <video className="video" playsInline ref={videoElement}/>
      <button
        disabled={processing}
        style={{width: maxVideoSize, padding: 10}}
        onClick={onClick}
      >
        {processing ? 'Processing...' : 'Take a photo'}
      </button>
      <canvas
        ref={canvasEl}
        width={maxVideoSize}
        height={maxVideoSize}
      ></canvas>
    </div>
  )
}