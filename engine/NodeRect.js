import Animation from '../animation/Animation';

export default class NodeRect {
  constructor(node) {
    this._node = node;
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

  set(rect, incrementZ) {
    this.x = rect.x;
    this.y = rect.y;
    this.z = rect.z;
    this.width = rect.width;
    this.height = rect.height;
    if (incrementZ) rect.z += 2;
  }

  get x() {
    return this._node.getPosition()[0];
  }

  set x(value) {
    if (!Animation.collect(this, 'x', value)) {
      this._node.setPosition(value, undefined, undefined);
    }
  }

  get y() {
    return this._node.getPosition()[1];
  }

  set y(value) {
    if (!Animation.collect(this, 'y', value)) {
      this._node.setPosition(undefined, value, undefined);
    }
  }

  get z() {
    return this._node.getPosition()[2];
  }

  set z(value) {
    if (!Animation.collect(this, 'z', value)) {
      this._node.setPosition(undefined, undefined, value);
    }
  }

  get width() {
    return this._widthValue || this._node.getSize()[0];
  }

  set width(value) {
    if (value === true) {
      if (this._widthAbsolute) {
        this._node.setSizeMode('render');
        this._widthAbsolute = false;
        this._widthValue = undefined;
      }
    } else if (value !== this._node.getSize()[0]) {
      if (!this._widthAbsolute) {
        this._node.setSizeMode('absolute');
        this._widthAbsolute = true;
      }
      if (!Animation.collect(this, 'width', value)) {
        this._node.setAbsoluteSize(value);
        this._widthValue = value;
      }
    }
  }

  get height() {
    return this._heightValue || this._node.getSize()[1];
  }

  set height(value) {
    if (value === true) {
      if (this._heightAbsolute) {
        this._node.setSizeMode(undefined, 'render');
        this._heightAbsolute = false;
        this._heightValue = undefined;
      }
    } else if (value !== this._node.getSize()[1]) {
      if (!this._heightAbsolute) {
        this._node.setSizeMode(undefined, 'absolute');
        this._heightAbsolute = true;
      }
      if (!Animation.collect(this, 'height', value)) {
        this._node.setAbsoluteSize(undefined, value);
        this._heightValue = value;
      }
    }
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      width: this.width,
      height: this.height
    };
  }
}
NodeRect.identity = {x: 0, y: 0, z: 0, width: 0, height: 0};
