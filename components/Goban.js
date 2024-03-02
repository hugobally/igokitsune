import Point from './Point';
import Matrix from '@/components/Matrix'

class Goban {
  constructor(gameConfig) {
    this.points = this.initializeGoban(gameConfig.size);
  }

  initializeGoban(size) {
    // return new Matrix(19)
  }

  // findStones(gobanSourceImage) {
    // Set stones based on clustering results
    // this.points.flat().forEach((point, index) => {
    //   if (assignments[index] === minBrightnessIndex) {
    //     point.placeStone('black');
    //   } else if (assignments[index] === maxBrightnessIndex) {
    //     point.placeStone('white');
    //   } else {
    //     point.removeStone();
    //   }
    // });
  // }

  // printGoban() {
  //   console.log(this.points.map((row) => row.map((point) => point.getStone() || 'null').join(' ')).join('\n'));
  // }
}

export default Goban;
