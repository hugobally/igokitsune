class CV {
  imageProcessing(payload) {
    return this._dispatch({ msg: 'imageProcessing', payload })
  }

  _dispatch(event) {
    const { msg } = event
    this._status[msg] = ['loading']
    this.worker.postMessage(event)
    return new Promise((res, rej) => {
      let interval = setInterval(() => {
        const status = this._status[msg]
        if (status[0] === 'done') res(status[1])
        if (status[0] === 'error') rej(status[1])
        if (status[0] !== 'loading') {
          delete this._status[msg]
          clearInterval(interval)
        }
      }, 50)
    })
  }

  load() {
    this._status = {}
    this.worker = new Worker('/js/cv.worker.js') // load worker

    // Capture events and save [status, event] inside the _status object
    this.worker.onmessage = (e) => (this._status[e.data.msg] = ['done', e])
    this.worker.onerror = (e) => {
      console.log(e)
      // this._status[e.data.msg] = ['error', e]
    }
    console.log(this.worker)
    return this._dispatch({ msg: 'load' })
  }
}

export default new CV()