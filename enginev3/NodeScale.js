import Animation from '../animation/Animation';

export default class NodeScale {
  constructor(node) {
    this._node = node;
    this._x = 1;
    this._y = 1;
    this._z = 1;
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
    return this._x;
  }

  set x(value) {
    if (!Animation.collect(this, 'x', value)) {
      this._x = value;
      this._node._resultSpecDirty = true;
    }
  }

  get y() {
    return this._y;
  }

  set y(value) {
    if (!Animation.collect(this, 'y', value)) {
      this._y = value;
      this._node._resultSpecDirty = true;
    }
  }

  get z() {
    return this._z;
  }

  set z(value) {
    if (!Animation.collect(this, 'z', value)) {
      this._z = value;
      this._node._resultSpecDirty = true;
    }
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return {
      x: this._x,
      y: this._y,
      z: this._z
    };
  }
}
NodeScale.identity = {
  x: 1,
  y: 1,
  z: 1
};
