import Point from './Point';

class Goban {
  constructor(size) {
    this.size = size;
    this.points = this.initializeGoban();
  }

  initializeGoban() {
    return Array.from({ length: this.size }, (row, rowIndex) =>
      Array.from({ length: this.size }, (col, colIndex) => new Point(rowIndex, colIndex))
    );
  }

  findStones(image) {
    // Perform k-means clustering
    const brightnessValues = this.points.flat().map((point) => point.getBrightness(this.image));
    const clusters = tf.cluster.kmeans(tf.tensor1d(brightnessValues), 3);

    // Get cluster assignments
    const assignments = clusters.assignments.arraySync();

    // Calculate average brightness for each cluster
    const clusterBrightness = clusters.centers.arraySync().map((center) => center[0]);

    // Find the index of the cluster with the smallest and largest average brightness
    const minBrightnessIndex = clusterBrightness.indexOf(Math.min(...clusterBrightness));
    const maxBrightnessIndex = clusterBrightness.indexOf(Math.max(...clusterBrightness));

    // Set stones based on clustering results
    this.points.flat().forEach((point, index) => {
      if (assignments[index] === minBrightnessIndex) {
        point.placeStone('black');
      } else if (assignments[index] === maxBrightnessIndex) {
        point.placeStone('white');
      } else {
        point.removeStone();
      }
    });
  }

  drawOverlay(canvas) {

  }

  printGoban() {
    console.log(this.points.map((row) => row.map((point) => point.getStone() || 'null').join(' ')).join('\n'));
  }
}

export default Goban;
