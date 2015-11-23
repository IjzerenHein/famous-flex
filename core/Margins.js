import SizeProperty from './SizeProperty';

export default class Margins {
  constructor() {
    const onChange = () => this.onChange();
    this._top = new SizeProperty();
    this._top.onChange = onChange;
    this._bottom = new SizeProperty();
    this._bottom.onChange = onChange;
    this._left = new SizeProperty();
    this._left.onChange = onChange;
    this._right = new SizeProperty();
    this._right.onChange = onChange;
  }

  get left() {
    return this._left;
  }

  set left(value) {
    this._left.set(value);
  }

  get right() {
    return this._right;
  }

  set right(value) {
    this._right.set(value);
  }

  get top() {
    return this._top;
  }

  set top(value) {
    this._top.set(value);
  }

  get bottom() {
    return this._bottom;
  }

  set bottom(value) {
    this._bottom.set(value);
  }

  set(value) {
    if ((typeof value === 'number') || (typeof value === 'string')) {
      this.left = value;
      this.top = value;
      this.right = value;
      this.bottom = value;
    } else if (Array.isArray(value)) {
      if (value.length === 1) {
        this.left = value[0];
        this.top = value[0];
        this.right = value[0];
        this.bottom = value[0];
      } else if (value.length === 2) {
        this.left = value[1];
        this.top = value[0];
        this.right = value[1];
        this.bottom = value[0];
      } else if (value.length === 4) {
        this.left = value[3];
        this.top = value[0];
        this.right = value[1];
        this.bottom = value[2];
      }
    } else if (value) {
      this.left = value.left || 0;
      this.top = value.top || 0;
      this.right = value.right || 0;
      this.bottom = value.bottom || 0;
    }
  }

  subtract(rect) {
    const left = this._left.resolve(rect.parent.width);
    const top = this._top.resolve(rect.parent.height);
    rect.x += left;
    rect.y += top;
    rect.width -= (left + this._right.resolve(rect.parent.width));
    rect.height -= (top + this._top.resolve(rect.parent.height));
  }

  onChange() {
    // override to implement
  }
}
