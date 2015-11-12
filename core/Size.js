import Animation from '../animation/Animation';
import Padding from './Padding';
const parse = Padding.parseComponent;

const Mode = {
  NONE: 0,
  COVER: 1,
  CONTAIN: 2
};

export default class Size {
  constructor() {
    this._mode = Mode.NONE;
  }

  measure(rect, naturalSize) {
    if (this._callback) {
      return this._callback(rect, naturalSize);
    }
    let width = rect.width;
    let height = rect.height;
    if (this._width) {
      if (this._width[0] === true) {
        width = this._width[1] * naturalSize.width;
      } else {
        width = this._width[0] + (this._width[1] * rect.width);
      }
    }
    if (this._height) {
      if (this._height[0] === true) {
        height = this._height[1] * naturalSize.height;
      } else {
        height = this._height[0] + (this._height[1] * rect.height);
      }
    }
    if (this._maxWidth) width = Math.min(width, this._maxWidth[0] + (this._maxWidth[1] * rect.width));
    if (this._maxHeight) height = Math.min(height, this._maxHeight[0] + (this._maxHeight[1] * rect.height));
    if (this._minWidth) width = Math.max(width, this._minWidth[0] + (this._minWidth[1] * rect.width));
    if (this._minHeight) height = Math.max(height, this._minHeight[0] + (this._minHeight[1] * prect.height));
    let aspectRatio = this._aspectRatio;
    switch (this._mode) {
      case Mode.NONE:
        if (aspectRatio) {
          if (aspectRatio < (width / height)) {
            width = height * aspectRatio;
          } else {
            height = width / aspectRatio;
          }
        }
        break;
      case Mode.COVER:
        aspectRatio = aspectRatio || (width / height);
        if (aspectRatio > (rect.width / rect.height)) {
          width = rect.height * aspectRatio;
          height = rect.height;
        } else {
          width = rect.width;
          height = rect.width / aspectRatio;
        }
        break;
      case Mode.CONTAIN:
        aspectRatio = aspectRatio || (width / height);
        if (aspectRatio < (rect.width / rect.height)) {
          width = rect.height * aspectRatio;
          height = rect.height;
        } else {
          width = rect.width;
          height = rect.width / aspectRatio;
        }
        break;
    }
    this._lastWidth = this._lastWidth || [0, 0];
    this._lastHeight = this._lastHeight || [0, 0];
    this._lastWidth[0] = rect.width;
    this._lastHeight[0] = rect.height;
    this._result = this._result || {};
    this._result.width = width;
    this._result.height = height;
    return this._result;
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
      if (this._callback) this.callback = undefined;
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
      if (this._callback) this.callback = undefined;
    } else if (value instanceof Function) {
      this.callback = value;
      if (this._width) this.width = undefined;
      if (this._heigth) this.height = undefined;
      if (this._maxWidth) this.maxWidth = undefined;
      if (this._maxHeight) this.maxHeight = undefined;
      if (this._minWidth) this.minWidth = undefined;
      if (this._minHeight) this.minHeight = undefined;
      if (this._aspectRatio) this.aspectRatio = undefined;
      this.mode = Mode.NONE;
    } else {
      if (value.width || this._width) this.width = value.width;
      if (value.height || this._height) this.height = value.height;
      if (value.maxWidth || this._maxWidth) this.maxWidth = value.maxWidth;
      if (value.maxHeight || this._maxHeight) this.maxHeight = value.maxheight;
      if (value.minWidth || this._minWidth) this.minWidth = value.minWidth;
      if (value.minHeight || this._minHeight) this.minHeight = value.minHeight;
      if (value.aspectRatio || this._aspectRatio) this.aspectRatio = value.aspectRatio;
      if (this._callback) this.callback = undefined;
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

  get callback() {
    return this._callback;
  }

  set callback(value) {
    if (this._callback !== value) {
      this._callback = value;
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
    } else {
      value = parse(value);
      if (!this._lastWidth || !Animation.collect(this, 'width', value || this._lastWidth, this._width || this._lastWidth)) {
        this._width = value;
        this.onChange();
      }
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
    } else {
      value = parse(value);
      if (!this._lastHeight || !Animation.collect(this, 'height', value || this._lastHeight, this._height || this._lastHeight)) {
        this._height = value;
        this.onChange();
      }
    }
  }

  get maxWidth() {
    return this._maxWidth;
  }

  set maxWidth(value) {
    value = parse(value);
    if (!this._lastWidth || !Animation.collect(this, 'maxWidth', value || this._lastWidth, this._maxWidth || this._lastWidth)) {
      this._maxWidth = value;
      this.onChange();
    }
  }

  get maxHeight() {
    return this._maxHeight;
  }

  set maxHeight(value) {
    value = parse(value);
    if (!this._lastHeight || !Animation.collect(this, 'maxHeight', value || this._lastHeight, this._maxHeight || this._lastHeight)) {
      this._maxHeight = value;
      this.onChange();
    }
  }

  get minWidth() {
    return this._minWidth;
  }

  set minWidth(value) {
    value = parse(value);
    if (!this._lastWidth || !Animation.collect(this, 'minWidth', value || this._lastWidth, this._minWidth || this._lastWidth)) {
      this._minWidth = value;
      this.onChange();
    }
  }

  get minHeight() {
    return this._minHeight;
  }

  set minHeight(value) {
    value = parse(value);
    if (!this._lastHeight || !Animation.collect(this, 'minHeight', value || this._lastHeight, this._minHeight || this._lastHeight)) {
      this._minHeight = value;
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
