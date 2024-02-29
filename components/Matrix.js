class Matrix {
  constructor(size, entryFunction) {
    this.size = size;
    this.data = this.initializeMatrix(size, entryFunction);
  }

  initializeMatrix(size, entryFunction) {
    return Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => entryFunction(row, col))
    );
  }

  entryAt(row, col) {
    return this.data[row][col]
  }

  forEach(callback) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        callback(this.data[row][col], row, col, this);
      }
    }
  }

  // setEntries(entryFunction) {
  //   for (let i = 0; i < this.size; i++) {
  //     for (let j = 0; j < this.size; j++) {
  //       this.data[i][j] = entryFunction(i, j, this.data[i][j]);
  //     }
  //   }
  // }

  printMatrix() {
    console.log(this.data.map(row => row.join(' ')).join('\n'));
  }
}