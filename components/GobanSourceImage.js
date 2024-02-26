class GobanSourceImage extends Image {
  constructor(width, height, gobanCornerCoords, gobanSize) {
    super(width, height);
    this.gobanSize = gobanSize;
    this.gobanCoordinates = new Matrix(gobanSize, (i, j) => this.calculateCoordinate(gobanCornerCoords, i, j));
  }

  calculateCoordinate(gobanCorners, i, j) {
    const { topLeft, topRight, bottomLeft } = gobanCorners;
    const x = lerp(topLeft.x, topRight.x, i / (this.gobanSize - 1));
    const y = lerp(topLeft.y, bottomLeft.y, j / (this.gobanSize - 1));
    return { x, y };
  }

  findStones(image, pointCoords, regionSize) {
    const imageMat = image.getImageMat();

    const roiWidth = regionSize.width;
    const roiHeight = regionSize.height;

    const roiX = pointCoords.x - roiWidth / 2;
    const roiY = pointCoords.y - roiHeight / 2;

    const roiMat = imageMat.roi(new cv.Rect(roiX, roiY, roiWidth, roiHeight)).clone();

    const grayMat = new cv.Mat();
    cv.cvtColor(roiMat, grayMat, cv.COLOR_RGBA2GRAY);

    const meanValue = cv.mean(grayMat);

    roiMat.delete();
    grayMat.delete();

    return meanValue;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default GobanSourceImage;