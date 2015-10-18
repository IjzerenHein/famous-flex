import Animation from '../animation/Animation';

export default class NodeScale {
  constructor(node) {
    this._node = node;
  }

  set(values) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, values.x);
      Animation.collect(this, 'y', this.y, values.y);
      Animation.collect(this, 'z', this.z, values.z);
    } else {
      this._node.setScale(values.x, values.y, values.z);
    }
  }

  get x() {
    return this._node.getScale()[0];
  }

  set x(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, value);
    } else {
      this._node.setScale(value, undefined, undefined);
    }
  }

  get y() {
    return this._node.getScale()[1];
  }

  set y(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'y', this.y, value);
    } else {
      this._node.setScale(undefined, value, undefined);
    }
  }

  get z() {
    return this._node.getScale()[2];
  }

  set z(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'z', this.z, value);
    } else {
      this._node.setScale(undefined, undefined, value);
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
NodeScale.identity = {x: 1, y: 1, z: 1};
