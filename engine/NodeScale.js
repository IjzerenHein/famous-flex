import Animation from '../animation/Animation';

export default class NodeScale {
  constructor(node) {
    this._node = node;
  }

  getParent() {
    return this._node.getParent();
  }

  get identity() {
    return NodeScale.identity;
  }

  set(values) {
    this.x = values.x;
    this.y = values.y;
    this.z = values.z;
  }

  get x() {
    return this._node.getScale()[0];
  }

  set x(value) {
    if (!Animation.collect(this, 'x', value)) {
      this._node.setScale(value, undefined, undefined);
    }
  }

  get y() {
    return this._node.getScale()[1];
  }

  set y(value) {
    if (!Animation.collect(this, 'y', value)) {
      this._node.setScale(undefined, value, undefined);
    }
  }

  get z() {
    return this._node.getScale()[2];
  }

  set z(value) {
    if (!Animation.collect(this, 'z', value)) {
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
