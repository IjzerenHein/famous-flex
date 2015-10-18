import Animation from '../animation/Animation';

export default class NodeRotation {
  constructor(node) {
    this._node = node;
    this._x = 0;
    this._y = 0;
    this._z = 0;
  }

  set(values) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, values.x);
      Animation.collect(this, 'y', this.y, values.y);
      Animation.collect(this, 'z', this.z, values.z);
    } else {
      this._node.setRotation(values.x, values.y, values.z);
      if (values.x !== undefined) this._x = values.x;
      if (values.y !== undefined) this._y = values.y;
      if (values.z !== undefined) this._z = values.z;
    }
  }

  get x() {
    return this._x;
  }

  set x(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, value);
    } else {
      this._x = value;
      this._node.setRotation(value, undefined, undefined);
    }
  }

  get y() {
    return this._y;
  }

  set y(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'y', this.y, value);
    } else {
      this._y = value;
      this._node.setRotation(undefined, value, undefined);
    }
  }

  get z() {
    return this._z;
  }

  set z(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'z', this.z, value);
    } else {
      this._z = value;
      this._node.setRotation(undefined, undefined, value);
    }
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }
}
NodeRotation.identity = {x: 0, y: 0, z: 0};
