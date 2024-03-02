import Image from '@/components/Image'
import Matrix from '@/components/Matrix'
import { kmeans } from 'ml-kmeans';

class GobanSourceImage extends Image {
  constructor(mat, cornerCoords, gobanSize) {
    super(mat);

    console.log(cornerCoords)
    this.gobanSize = gobanSize;
    this.points = new Matrix(gobanSize, (row, col) => ({coords: this.calculateCoordinate(cornerCoords, row, col),brightness: null}));
  }

  calculateCoordinate(gobanCorners, row, col) {
    const { topLeft, topRight, bottomLeft } = gobanCorners;
    const x = lerp(topLeft.x, topRight.x, col / (this.gobanSize - 1));
    const y = lerp(topLeft.y, bottomLeft.y, row / (this.gobanSize - 1));
    return { x, y };
  }

  findStones() {
    const debugPoints = []

    const firstPoint = this.points.entryAt(0, 0);
    const secondPoint = this.points.entryAt(0, 1);
    const regionSize = secondPoint.coords.x - firstPoint.coords.x;

    this.points.forEach((point)=> {
      point.brightness = this.getPointBrightness(point, regionSize)
      debugPoints.push(point)
    })

    // Extract brightness values from points
    // const brightnessValues = debugPoints.map(point => point.brightness);


    const k = 3; // You can adjust the number of clusters
    // Perform k-means clustering (assuming you have a k-means implementation)
    // const data = this.kMeans(brightnessValues, k); // You need to implement or use a k-means function
    // this.kMeans(debugPoints, k); // You need to implement or use a k-means function


    const highestBrightness = Math.max(...debugPoints.map(point => point.brightness));
    const lowestBrightness = Math.min(...debugPoints.map(point => point.brightness));
    const averageBrightness = debugPoints.reduce((sum, point) => sum + point.brightness, 0) / debugPoints.length;

    const initialCentroids = [[highestBrightness], [lowestBrightness], [averageBrightness]]
    console.log(initialCentroids)

    const dataForClustering = debugPoints.map(point => [point.brightness]);

    const { clusters, centroids } = kmeans(dataForClustering, k, { initialization: initialCentroids});
    // Perform k-means clustering

    // Find cluster with highest and lowest centroid
    const maxCentroidIndex = centroids.reduce((maxIndex, centroid, index) => (centroid > centroids[maxIndex] ? index : maxIndex), 0);
    const minCentroidIndex = centroids.reduce((minIndex, centroid, index) => (centroid < centroids[minIndex] ? index : minIndex), 0);

    debugPoints.forEach((point, index) => {
      if (clusters[index] === maxCentroidIndex) {
        point.stone = 'black';
      } else if (clusters[index] === minCentroidIndex) {
        point.stone = 'neutral';
      } else {
        point.stone = 'white';
      }
    });

    // debugPoints.forEach((point, index) => {
    //   point.cluster = clusters[index];
    // });

    // const maxBrightness = Array.from({ length: k }, (_, clusterIndex) => {
    //   const values = data
    //     .filter(dataItem => dataItem.cluster === clusterIndex)
    //     .map(({ value }) => value)
    //
    //   return Math.max(values);
    // });

    // this.points.forEach((point)=> {
    //   clusterIndex = maxBrightness.findIndex(brightness => point.brightness <= brightness)
    //   if (points === minBrightnessCluster) {
    //     point.placeStone('black');
    //   } else if (clusters[index].cluster === maxBrightnessCluster) {
    //     point.placeStone('white');
    //   } else {
    //     point.removeStone();
    //   }
    //   debugPoints.push(point)
    // })

    // Log the clustering results
    console.log('Clustering Results:', debugPoints);

    return debugPoints
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
      console.log(outliers)
      return "I'm not sure :/"
    }
  }

  // Function to perform k-means clustering
  kMeans(data, k) {
    // Initialize centroids randomly
    let centroids = Array.from({ length: k }, () => data[Math.floor(Math.random() * data.length)].brightness);

    // Perform k-means iterations (you may need to adjust the number of iterations based on your data)
    const maxIterations = 100;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign each data point to the nearest centroid
      const assignments = data.map(point => ({
        value: point,
        cluster: centroids.reduce((minIndex, centroid, index) => {
          const distance = Math.abs(point.brightness - centroid);
          return distance < Math.abs(point.brightness - centroids[minIndex]) ? index : minIndex;
        }, 0),
      }));

      // Update centroids based on the mean of assigned data points
      centroids = Array.from({ length: k }, (_, cluster) => {
        const clusterPoints = assignments.filter(assign => assign.cluster === cluster);
        const clusterValues = clusterPoints.map(assign => assign.value.brightness);
        return clusterValues.length > 0 ? clusterValues.reduce((sum, value) => sum + value, 0) / clusterValues.length : centroids[cluster];
      });
    }

    // Return the final assignments
    data.forEach(point => {
      const cluster = centroids.reduce((minIndex, centroid, index) => {
        const distance = Math.abs(point.brightness - centroid);
        return distance < Math.abs(point.brightness - centroids[minIndex]) ? index : minIndex;
      }, 0)

      point.cluster = cluster
    });

    return data
  }

  getPointBrightness(point, regionSize) {
    const imageMat = this.imageMat

    const roiX = point.coords.x - regionSize / 2;
    const roiY = point.coords.y - regionSize / 2;

    const roiMat = imageMat.roi(new cv.Rect(roiX, roiY, regionSize, regionSize)).clone();

    const meanValue = Math.round(cv.mean(roiMat)[0]);

    roiMat.delete();

    return meanValue;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default GobanSourceImage;