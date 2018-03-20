const fs = require('fs');
const path = require('path')

class File {
  constructor(filePath) {
    this._filePath = filePath;
    this._type = fs.statSync(filePath).isDirectory() ? 'dir' : 'file';
    this._fileName = path.basename(filePath);
  }
  get isDirectory() {
    return this._type === 'dir';
  }
  get path() {
    return this._filePath;
  }
  getName() {
      return this._fileName;
  }
}

module.exports = File;