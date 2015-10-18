import Animation from '../animation/Animation';

export default class NodeRotation {
  constructor(node) {
    this._node = node;
  }

  set(values) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, values.x);
      Animation.collect(this, 'y', this.y, values.y);
      Animation.collect(this, 'z', this.z, values.z);
    } else {
      this._node.setRotation(values.x, values.y, values.z);
    }
  }

  get x() {
    return this._node.getRotation()[0];
  }

  set x(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, value);
    } else {
      this._node.setRotation(value, undefined, undefined);
    }
  }

  get y() {
    return this._node.getRotation()[1];
  }

  set y(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'y', this.y, value);
    } else {
      this._node.setRotation(undefined, value, undefined);
    }
  }

  get z() {
    return this._node.getRotation()[2];
  }

  set z(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'z', this.z, value);
    } else {
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
