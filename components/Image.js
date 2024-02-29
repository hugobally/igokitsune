class Image {
  #imageMat = null;

  constructor(mat) {
    this.#imageMat = mat
    this.width = mat.cols;
    this.height = mat.rows;
  }

  get imageMat() {
    // if (this.#imageMat === null) {
    //   this.#imageMat = this.createImageMat();
    // }
    return this.#imageMat;
  }
  
  toImageData() {
    new ImageData(
      new Uint8ClampedArray(this.#imageMat.data),
      this.width,
      this.height
    );
  }
}

export default Image;