class Matrix {
  constructor(size, entryFunction) {
    this.size = size;
    this.data = this.initializeMatrix(size, entryFunction);
  }

  initializeMatrix(size, entryFunction) {
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => entryFunction(i, j))
    );
  }

  setEntries(entryFunction) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.data[i][j] = entryFunction(i, j, this.data[i][j]);
      }
    }
  }

  printMatrix() {
    console.log(this.data.map(row => row.join(' ')).join('\n'));
  }
}