import Margins from './Margins';

export default class Rect {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.width = 0;
    this.height = 0;
  }

  get bottom() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }

  center() {
    this.x = this.parent.x + ((this.parent.width - this.width) / 2);
    this.y = this.parent.y + ((this.parent.height - this.height) / 2);
    return this;
  }

  centerX() {
    this.x = this.parent.x + ((this.parent.width - this.width) / 2);
    return this;
  }

  centerY() {
    this.y = this.parent.y + ((this.parent.height - this.height) / 2);
    return this;
  }

  subtract(value) {
    if (value === undefined) {
      return this;
    } else if (typeof value === 'number') {
      this.width -= (value * 2);
      this.height -= (value * 2);
      this.x += value;
      this.y -= value;
      return this;
    } else {
      Margins.apply(value, this);
    }
    return this;
  }

  inFront() {
    this.z += 5;
  }

  behind() {
    this.z -= 5;
  }

  log() {
    console.log(JSON.stringify(this));
  }
}
