import Animation from '../animation/Animation';
import Margins from './Margins';
const parse = Margins.parseComponent;

const Mode = {
  NONE: 0,
  COVER: 1,
  CONTAIN: 2
};

export default class Size {
  constructor(node) {
    this._node = node;
    this._mode = Mode.NONE;
  }

  measure(rect) {
    const parent = rect.parent;
    if (this._width) {
      if (this._width[0] === true) {
        rect.width = this._width[1] * rect.width;
      } else {
        rect.width = this._width[0] + (this._width[1] * parent.width);
      }
    } else {
      rect.width = parent.width;
    }
    if (this._height) {
      if (this._height[0] === true) {
        rect.height = this._height[1] * rect.height;
      } else {
        rect.height = this._height[0] + (this._height[1] * parent.height);
      }
    } else {
      rect.height = parent.height;
    }
    if (this._maxWidth) rect.width = Math.min(rect.width, this._maxWidth[0] + (this._maxWidth[1] * parent.width));
    if (this._maxHeight) rect.height = Math.min(rect.height, this._maxHeight[0] + (this._maxHeight[1] * parent.height));
    if (this._minWidth) rect.width = Math.max(rect.width, this._minWidth[0] + (this._minWidth[1] * parent.width));
    if (this._minHeight) rect.height = Math.max(rect.height, this._minHeight[0] + (this._minHeight[1] * parent.height));
    let aspectRatio = this._aspectRatio;
    switch (this._mode) {
      case Mode.NONE:
        if (aspectRatio) {
          if (aspectRatio < (rect.width / rect.height)) {
            rect.width = rect.height * aspectRatio;
          } else {
            rect.height = rect.width / aspectRatio;
          }
        }
        break;
      case Mode.COVER:
        aspectRatio = aspectRatio || (rect.width / rect.height);
        if (aspectRatio > (parent.width / parent.height)) {
          rect.width = parent.height * aspectRatio;
          rect.height = parent.height;
        } else {
          rect.width = parent.width;
          rect.height = parent.width / aspectRatio;
        }
        break;
      case Mode.CONTAIN:
        aspectRatio = aspectRatio || (rect.width / rect.height);
        if (aspectRatio < (parent.width / parent.height)) {
          rect.width = parent.height * aspectRatio;
          rect.height = parent.height;
        } else {
          rect.width = parent.width;
          rect.height = parent.width / aspectRatio;
        }
        break;
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
      this.mode = (value.length >= 3) ? value[2] : Mode.NONE;
      if (this._maxWidth) this.maxWidth = undefined;
      if (this._maxHeight) this.maxHeight = undefined;
      if (this._minWidth) this.minWidth = undefined;
      if (this._minHeight) this.minHeight = undefined;
      if (this._aspectRatio) this.aspectRatio = undefined;
    } else if ((value instanceof String) || (typeof value === 'string')) {
      if (value === 'cover') {
        this.width = true;
        this.height = true;
        this.mode = Mode.COVER;
      } else if (value === 'contain') {
        this.width = true;
        this.height = true;
        this.mode = Mode.CONTAIN;
      } else {
        // TODO, "100% 50%", "500px 100px", "100px", "50%"
        this.mode = Mode.NONE;
      }
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
      this.mode = Mode.NONE;
    }
  }

  get requiresNaturalSize() {
    return (this._width && (this._width[0] === true)) || (this._height && (this._height[0] === true));
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    if (this._mode !== value) {
      this._mode = value;
      this.onChange();
    }
  }

  get width() {
    return this._width;
  }

  /**
   * Sets the configured width.
   *
   */
  set width(value) {
    if (value === true) {
      this._width = this._width || [0, 0];
      this._width[0] = true;
      this._width[1] = 1;
      this.onChange();
    } else if (Array.isArray(value) && (value[0] === true)) {
      this._width = this._width || [0, 0];
      this._width[0] = value[0];
      this._width[1] = value[1];
      this.onChange();
    } else if (!this._lastWidth || !Animation.collect(this, 'width', parse(value) || this._lastWidth, this._width || this._lastWidth)) {
      this._width = parse(value);
      this.onChange();
    }
  }

  get height() {
    return this._height;
  }

  set height(value) {
    if (value === true) {
      this._height = this._height || [0, 0];
      this._height[0] = true;
      this._height[1] = 1;
      this.onChange();
    } else if (Array.isArray(value) && (value[0] === true)) {
      this._height = this._height || [0, 0];
      this._height[0] = value[0];
      this._height[1] = value[1];
      this.onChange();
    } else if (!this._lastHeight || !Animation.collect(this, 'height', parse(value) || this._lastHeight, this._height || this._lastHeight)) {
      this._height = parse(value);
      this.onChange();
    }
  }

  get maxWidth() {
    return this._maxWidth;
  }

  set maxWidth(value) {
    if (!this._lastWidth || !Animation.collect(this, 'maxWidth', parse(value) || this._lastWidth, this._maxWidth || this._lastWidth)) {
      this._maxWidth = parse(value);
      this.onChange();
    }
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(value) {
    if (!this._lastHeight || !Animation.collect(this, 'maxHeight', parse(value) || this._lastHeight, this._maxHeight || this._lastHeight)) {
      this._maxHeight = parse(value);
      this.onChange();
    }
  }

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value) {
    if (!this._lastWidth || !Animation.collect(this, 'minWidth', parse(value) || this._lastWidth, this._minWidth || this._lastWidth)) {
      this._minWidth = parse(value);
      this.onChange();
    }
  }

  get minHeight() {
    return this._minHeight;
  }

  set minHeight(value) {
    if (!this._lastHeight || !Animation.collect(this, 'minHeight', parse(value) || this._lastHeight, this._minHeight || this._lastHeight)) {
      this._minHeight = parse(value);
      this.onChange();
    }
  }

  get aspectRatio() {
    return this._aspectRatio;
  }

  set aspectRatio(value) {
    const aspectRatio = Array.isArray(value) ? (value[0] / value[1]) : value;
    if (!this._lastHeight || !Animation.collect(this, 'aspectRatio', aspectRatio || (this._lastWidth[0] / this._lastHeight[0]), this._aspectRatio || (this._lastWidth[0] / this._lastHeight[0]))) {
      this._aspectRatio = aspectRatio;
      this.onChange();
    }
  }

  onChange() {
    // override to implement
  }
}
