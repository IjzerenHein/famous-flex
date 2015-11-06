import Animation from '../animation/Animation';

export default class Point {
  constructor() {
    this._x = 0;
    this._y = 0;
    this._z = 0;
  }

  set(value) {
    if (Array.isArray(value)) {
      this.x = value[0];
      this.y = value[1];
      if (value.length >= 2) {
        this.z = value[2];
      }
    } else if ((value instanceof Number) || (typeof value === 'number')) {
      this.x = value;
      this.y = value;
      this.z = value;
    } else {
      if (value.x !== undefined) this.x = value.x;
      if (value.y !== undefined) this.y = value.y;
      if (value.z !== undefined) this.z = value.z;
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

  get z() {
    return this._z;
  }

  set z(value) {
    if (!Animation.collect(this, 'z', value)) {
      if (this._z !== value) {
        this._z = value;
        this.onChange();
      }
    }
  }

  onChange() {
    // override to implement
  }
}
