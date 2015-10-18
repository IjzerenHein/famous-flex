export default class NodeOrigin {
  constructor(node) {
    this._node = node;
  }

  set(values) {
    this._node.setAlign(values.x, values.y, values.z);
    this._node.setOrigin(values.x, values.y, values.z);
    this._node.setMountPoint(values.x, values.y, values.z);
  }

  get x() {
    return this._node.getOrigin()[0];
  }

  set x(value) {
    this._node.setAlign(value);
    this._node.setOrigin(value);
    this._node.setMountPoint(value);
  }

  get y() {
    return this._node.getOrigin()[1];
  }

  set y(value) {
    this._node.setAlign(undefined, value);
    this._node.setOrigin(undefined, value);
    this._node.setMountPoint(undefined, value);
  }

  get z() {
    return this._node.getOrigin()[2];
  }

  set z(value) {
    this._node.setAlign(undefined, undefined, value);
    this._node.setOrigin(undefined, undefined, value);
    this._node.setMountPoint(undefined, undefined, value);
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
NodeOrigin.identity = {x: 0, y: 0, z: 0};
