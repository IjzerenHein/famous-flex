import Animation from './Animation';
import {Margins} from '../utilities';
const parse = Margins.parseComponent;

export default class Size {
  constructor(options) {
    if (options) {
      this.set(options);
    }
  }

  resolve(rect) {
    const parent = rect.parent;
    rect.width = parent.width;
    rect.height = parent.height;
    if (this._width) rect.width = this._width[0] + (this._width[1] * parent.width);
    if (this._height) rect.height = this._height[0] + (this._height[1] * parent.height);
    if (this._maxWidth) rect.width = Math.min(rect.width, this._maxWidth[0] + (this._maxWidth[1] * parent.width));
    if (this._maxHeight) rect.height = Math.min(rect.height, this._maxHeight[0] + (this._maxHeight[1] * parent.height));
    if (this._minWidth) rect.width = Math.max(rect.width, this._minWidth[0] + (this._minWidth[1] * parent.width));
    if (this._minHeight) rect.height = Math.max(rect.height, this._minHeight[0] + (this._minHeight[1] * parent.height));
    if (this._aspectRatio) {
      if (this._aspectRatio < (rect.width / rect.height)) {
        rect.width = rect.height * this._aspectRatio;
      } else {
        rect.height = rect.width / this._aspectRatio;
      }
    }
    this._lastWidth = this._lastWidth || [0, 0];
    this._lastHeight = this._lastHeight || [0, 0];
    this._lastWidth[0] = parent.width;
    this._lastHeight[0] = parent.height;
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
      Animation.collect(this, 'width', this._width || this._lastWidth, parse(value) || this._lastWidth);
    } else {
      this._width = parse(value);
      this.onChange();
    }
  }

  get height() {
    return this._height;
  }

  set height(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'height', this._height || this._lastHeight, parse(value) || this._lastHeight);
    } else {
      this._height = parse(value);
      this.onChange();
    }
  }

  get maxWidth() {
    return this._maxWidth;
  }

  set maxWidth(value) {
    if (Animation.isCollecting && this._lastWidth) {
      Animation.collect(this, 'maxWidth', this._maxWidth || this._lastWidth, parse(value) || this._lastWidth);
    } else {
      this._maxWidth = parse(value);
      this.onChange();
    }
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'maxHeight', this._maxHeight || this._lastHeight, parse(value) || this._lastHeight);
    } else {
      this._maxHeight = parse(value);
      this.onChange();
    }
  }

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value) {
    if (Animation.isCollecting && this._lastWidth) {
      Animation.collect(this, 'minWidth', this._minWidth || this._lastWidth, parse(value) || this._lastWidth);
    } else {
      this._minWidth = parse(value);
      this.onChange();
    }
  }

  get minHeight() {
    return this._minHeight;
  }

  set minHeight(value) {
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'minHeight', this._minHeight || this._lastHeight, parse(value) || this._lastHeight);
    } else {
      this._minHeight = parse(value);
      this.onChange();
    }
  }

  get aspectRatio() {
    return this._aspectRatio;
  }

  set aspectRatio(value) {
    const aspectRatio = Array.isArray(value) ? (value[0] / value[1]) : value;
    if (Animation.isCollecting && this._lastHeight) {
      Animation.collect(this, 'aspectRatio', this._aspectRatio || (this._lastWidth[0] / this._lastHeight[0]), aspectRatio || (this._lastWidth[0] / this._lastHeight[0]));
    } else {
      this._aspectRatio = aspectRatio;
      this.onChange();
    }
  }

  onChange() {
    // override to implement
  }
}
