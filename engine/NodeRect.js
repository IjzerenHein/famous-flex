import Animation from '../animation/Animation';

export default class NodeRect {
  constructor(node) {
    this._node = node;
  }

  set(rect, incrementZ) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, rect.x);
      Animation.collect(this, 'y', this.y, rect.y);
      Animation.collect(this, 'z', this.z, rect.z);
      Animation.collect(this, 'width', this.width, rect.width);
      Animation.collect(this, 'height', this.height, rect.height);
    } else {
      this._node.setPosition(rect.x, rect.y, rect.z);
      this.width = rect.width;
      this.height = rect.height;
    }
    rect.z += incrementZ ? 2 : 0;
  }

  get x() {
    return this._node.getPosition()[0];
  }

  set x(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'x', this.x, value);
    } else {
      this._node.setPosition(value, undefined, undefined);
    }
  }

  get y() {
    return this._node.getPosition()[1];
  }

  set y(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'y', this.y, value);
    } else {
      this._node.setPosition(undefined, value, undefined);
    }
  }

  get z() {
    return this._node.getPosition()[2];
  }

  set z(value) {
    if (Animation.isCollecting) {
      Animation.collect(this, 'z', this.z, value);
    } else {
      this._node.setPosition(undefined, undefined, value);
    }
  }

  get width() {
    return this._node.getSize()[0];
  }

  set width(value) {
    if (value === true) {
      if (this._widthAbsolute) {
        this._node.setSizeMode('render');
        this._widthAbsolute = false;
      }
    } else if (value !== this._node.getSize()[0]) {
      if (!this._widthAbsolute) {
        this._node.setSizeMode('absolute');
        this._widthAbsolute = true;
      }
      if (Animation.isCollecting) {
        Animation.collect(this, 'width', this.width, value);
      } else {
        this._node.setAbsoluteSize(value);
      }
    }
  }

  get height() {
    return this._node.getSize()[1];
  }

  set height(value) {
    if (value === true) {
      if (this._heightAbsolute) {
        this._node.setSizeMode(undefined, 'render');
        this._heightAbsolute = false;
      }
    } else if (value !== this._node.getSize()[1]) {
      if (!this._heightAbsolute) {
        this._node.setSizeMode(undefined, 'absolute');
        this._heightAbsolute = true;
      }
      if (Animation.isCollecting) {
        Animation.collect(this, 'height', this.height, value);
      } else {
        this._node.setAbsoluteSize(undefined, value);
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
