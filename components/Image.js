class Image {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getImageMat() {
    // Simulated function, replace it with actual logic to convert Image to OpenCV mat
    return new cv.Mat(this.height, this.width, cv.CV_8UC4, [255, 255, 255, 255]); // Replace with actual data
  }
}

export default Image;