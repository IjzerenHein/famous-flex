export default class Rect {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.width = 0;
    this.height = 0;
  }

  set(rect, parent) {
    this.x = rect.x;
    this.y = rect.y;
    this.z = rect.z;
    this.width = rect.width;
    this.height = rect.height;
    this.parent = parent || this.parent;
  }

  get bottom() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }

  center() {
    this.x = (this.parent.width - this.width) / 2;
    this.y = (this.parent.height - this.height) / 2;
    return this;
  }

  centerX() {
    this.x = (this.parent.width - this.width) / 2;
    return this;
  }

  centerY() {
    this.y = (this.parent.height - this.height) / 2;
    return this;
  }

  align(align) {
    this.x = (this.parent.width * align.x) - (align.x * this.width);
    this.y = (this.parent.height * align.y) - (align.y * this.height);
    return this;
  }

  alignX(value) {
    this.x = (this.parent.width * value) - (value * this.width);
    return this;
  }

  alignY(value) {
    this.y = (this.parent.height * value) - (value * this.height);
    return this;
  }

  subtract(value) {
    if (value === undefined) {
      return this;
    } else if (typeof value === 'number') {
      this.width -= (value * 2);
      this.height -= (value * 2);
      this.x += value;
      this.y += value;
      return this;
    } else {
      value.subtract(this);
      return this;
    }
  }

  intersectsWith(rect) {
    return (
      (((rect.x >= this.x) && (rect.x <= (this.x + this.width))) ||
      (((rect.x + rect.width) >= this.x) && ((rect.x + rect.width) <= (this.x + this.width)))) &&
      (((rect.y >= this.y) && (rect.y <= (this.y + this.height))) ||
      (((rect.y + rect.height) >= this.y) && ((rect.y + rect.height) <= (this.y + this.height)))));
  }

  inFront() {
    this.z += 5;
  }

  behind() {
    this.z -= 5;
  }

  toString() {
    return JSON.stringify(this);
  }
}
