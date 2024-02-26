class Point {
  constructor() {
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
}

export default Point;