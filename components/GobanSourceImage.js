import Image from '@/components/Image'

class GobanSourceImage extends Image {
  constructor(mat, cornerCoords, gobanSize) {
    super(mat);

    this.gobanSize = gobanSize;
    this.points = new Matrix(gobanSize, (i, j) => ({coords: this.calculateCoordinate(cornerCoords, i, j),brightness: null}));
  }

  calculateCoordinate(gobanCorners, i, j) {
    const { topLeft, topRight, bottomLeft } = gobanCorners;
    const x = lerp(topLeft.x, topRight.x, i / (this.gobanSize - 1));
    const y = lerp(topLeft.y, bottomLeft.y, j / (this.gobanSize - 1));
    return { x, y };
  }

  findStones() {
    const brightnessValues = []

    const firstPoint = this.points.entryAt(0, 0);
    const secondPoint = this.points.entryAt(0, 1);
    const regionSize = secondPoint.coords.x - firstPoint.coords.x;

    this.points.forEach((point)=> {
      point.brightness = this.getPointBrightness(point, regionSize)
      brightnessValues.push(point.brightness)
    })

    console.log(this.analyzeData(brightnessValues))

    return brightnessValues

    // return new Matrix(this.gobanSize, (row, col) => {
    //   return this.points.entryAt(row, col).brightness
    // });
  }

  analyzeData(data) {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const squaredDifferences = data.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / data.length;
    const standardDeviation = Math.sqrt(variance);

    const outlierThreshold = 2 * standardDeviation;
    const outliers = data.filter(value => Math.abs(value - mean) > outlierThreshold);

    if (outliers.length === 1) {
      return "One value is significantly different.";
    } else if (outliers.length === 0) {
      return "Values are clustered together.";
    } else {
      return "I'm not sure :/"
    }
  }

  getPointBrightness(point, regionSize) {
    const imageMat = this.imageMat()

    const roiX = point.coords.x - regionSize / 2;
    const roiY = point.coords.y - regionSize / 2;

    const roiMat = imageMat.roi(new cv.Rect(roiX, roiY, regionSize, regionSize)).clone();

    const meanValue = cv.mean(roiMat);

    roiMat.delete();

    return meanValue;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default GobanSourceImage;