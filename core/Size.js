import Animation from './Animation';
import {Margins} from '../utilities';
const parse = Margins.parseComponent;

export default class Size {
  constructor(options) {
    if (options) {
      this.set(options);
    }
  }

  resolve(size, spec) {
    spec.width = size[0];
    spec.height = size[1];
    if (this._width) spec.width = this._width[0] + (this._width[1] * size[0]);
    if (this._height) spec.height = this._height[0] + (this._height[1] * size[1]);
    if (this._maxWidth) spec.width = Math.min(spec.width, this._maxWidth[0] + (this._maxWidth[1] * size[0]));
    if (this._maxHeight) spec.height = Math.min(spec.height, this._maxHeight[0] + (this._maxHeight[1] * size[1]));
    if (this._minWidth) spec.width = Math.max(spec.width, this._minWidth[0] + (this._minWidth[1] * size[0]));
    if (this._minHeight) spec.height = Math.max(spec.height, this._minHeight[0] + (this._minHeight[1] * size[1]));
    if (this._aspectRatio) {
      if (this._aspectRatio < (spec.width / spec.height)) {
        spec.width = spec.height * this._aspectRatio;
      } else {
        spec.height = spec.width / this._aspectRatio;
      }
    }
  }

  set(value) {
    if (Array.isArray(value)) {
      this.width = value[0];
      this.height = value[1];
      if (this._maxWidth) this.maxWidth = undefined;
      if (this._maxHeight) this.maxHeight = undefined;
      if (this._minWidth) this.minWidth = undefined;
      if (this._minHeight) this.minHeight = undefined;
      if (this._aspectRatio) this.aspectRatio = undefined;
    } else {
      if (value.width || this._width) this.width = value.width;
      if (value.height || this._height) this.height = value.height;
      if (value.maxWidth || this._maxWidth) this.maxWidth = value.maxWidth;
      if (value.maxHeight || this._maxHeight) this.maxHeight = value.maxheight;
      if (value.minWidth || this._minWidth) this.minWidth = value.minWidth;
      if (value.minHeight || this._minHeight) this.minHeight = value.minHeight;
      if (value.aspectRatio || this._aspectRatio) this.aspectRatio = value.aspectRatio;
    }
  }

  get width() {
    return this._width;
  }

  set width(value) {
    if (Animation.isCollecting && this._lastWidth) {
      Animation.collect(this, 'width', this._width || this._lastWidth, parse(value));
    } else {
      this._width = parse(value);
      this.onValueChange();
    }
  }

  get height() {
    return this._height;
  }

  set height(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'height', this._height || this._lastHeight, parse(value));
    } else {
      this._height = parse(value);
      this.onValueChange();
    }
  }

  get maxWidth() {
    return this._maxWidth;
  }

  set maxWidth(value) {
    if (Animation.isCollecting && this._lastWidth) {
      Animation.collect(this, 'maxWidth', this._maxWidth || this._lastWidth, parse(value));
    } else {
      this._maxWidth = parse(value);
      this.onValueChange();
    }
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'maxHeight', this._maxHeight || this._lastHeight, parse(value));
    } else {
      this._maxHeight = parse(value);
      this.onValueChange();
    }
  }

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value) {
    if (Animation.isCollecting && this._lastWidth) {
      Animation.collect(this, 'minWidth', this._minWidth || this._lastWidth, parse(value));
    } else {
      this._minWidth = parse(value);
      this.onValueChange();
    }
  }

  get minHeight() {
    return this._minHeight;
  }

  set minHeight(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'minHeight', this._minHeight || this._lastHeight, parse(value));
    } else {
      this._minHeight = parse(value);
      this.onValueChange();
    }
  }

  get aspectRatio() {
    return this._aspectRatio;
  }

  set aspectRatio(value) {
    const aspectRatio = Array.isArray(value) ? (value[0] / value[1]) : value;
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'minHeight', this._aspectRatio || (this._lastWidth / this._lastHeight), aspectRatio);
    } else {
      this._aspectRatio = aspectRatio;
      this.onValueChange();
    }
  }

  onValueChange() {
    // override to implement
  }
}
