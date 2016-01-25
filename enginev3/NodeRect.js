import Animation from '../animation/Animation';

export default class NodeRect {
  constructor(node) {
    this._node = node;
    this._x = 0;
    this._y = 0;
    this._z = 0;
  }

  get node() {
    return this._node;
  }

  getParent() { // obsolete, should be removed
    return this._node.getParent();
  }

  get identity() {
    return NodeRect.identity;
  }

  get debug() {
    return this._debug;
  }

  set debug(value) {
    this._debug = value;
  }

  set(rect, incrementZ) {
    this.x = rect.x;
    this.y = rect.y;
    this.z = rect.z;
    this.width = rect.width;
    this.height = rect.height;
    if (incrementZ) rect.z += 2;
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

  get width() {
    return this._widthValue || this._node.getSize()[0];
  }

  set width(value) {
    if (value === true) {
      if (!this._widthRenderSize) {
        this._widthRenderSize = false;
        this._widthValue = undefined;
      }
    } else if (!Animation.collect(this, 'width', value)) {
      if (this._widthRenderSize) {
        this._widthRenderSize = false;
      }
      this._widthValue = value;
    }
  }

  get height() {
    return this._heightValue || this._node.getSize()[1];
  }

  set height(value) {
    if (value === true) {
      if (!this._heightRenderSize) {
        this._heightRenderSize = false;
        this._heightValue = undefined;
      }
    } else if (!Animation.collect(this, 'height', value)) {
      if (this._heightRenderSize) {
        this._heightRenderSize = false;
      }
      this._heightValue = value;
    }
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return {
      x: this._x,
      y: this._y,
      z: this._z,
      width: this.width,
      height: this.height
    };
  }
}
NodeRect.identity = {
  x: 0,
  y: 0,
  z: 0,
  width: 0,
  height: 0
};
