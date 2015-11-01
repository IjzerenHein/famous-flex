import Animation from '../animation/Animation';

export default class Point {
  constructor() {
    this._x = 0;
    this._y = 0;
  }

  resolve(rect) {
    // TODO
  }

  set(value) {
    if (Array.isArray(value)) {
      this.x = value[0];
      this.y = value[1];
    } else if (typeof value === 'number') {
      this.x = value;
      this.y = value;
    } else {
      if (value.x !== undefined) this.x = value.x;
      if (value.y !== undefined) this.y = value.y;
    }
  }

  get x() {
    return this._x;
  }

  set x(value) {
    if (!Animation.collect(this, 'x', value)) {
      if (this._x !== value) {
        this._x = value;
        this.onChange();
      }
    }
  }

  get y() {
    return this._y;
  }

  set y(value) {
    if (!Animation.collect(this, 'y', value)) {
      if (this._y !== value) {
        this._y = value;
        this.onChange();
      }
    }
  }

  onChange() {
    // override to implement
  }
}
