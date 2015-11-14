export default class Margins {
  constructor() {
    this._top = new SizeProperty();
    this._top.onChange = () => this.onChange();
    this._bottom = new SizeProperty();
    this._bottom.onChange = () => this.onChange();
    this._left = new SizeProperty();
    this._left.onChange = () => this.onChange();
    this._right = new SizeProperty();
    this._right.onChange = () => this.onChange();
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

  set left(value) {
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

  onChange() {
    // override to implement
  }
}
