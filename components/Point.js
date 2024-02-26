class Point {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.stone = null;
  }

  placeStone(color) {
    if (['black', 'white'].includes(color)) {
      this.stone = color;
    } else {
      console.error('Invalid stone color. Use "black" or "white".');
    }
  }

  removeStone() {
    this.stone = null;
  }

  getStone() {
    return this.stone;
  }

  getBrightness(image, gobanOrigin, gobanWidth) {
    const divisionResult = image.width / 19;
    console.log(`Brightness calculation: ${divisionResult}`);
    return 0;
  }
}

export default Point;