import Animation from '../animation/Animation';

export default class SizeProperty {
  constructor() {
    this._values = [0, 0];
  }

  get constant() {
    return this._values[0];
  }

  set constant(value) {
    if (!Animation.collect(this, 'constant', value) && (this._values[0] !== value)) {
      this._values[0] = value;
      this.onChange();
    }
  }

  get multiplier() {
    return this._values[1];
  }

  set multiplier(value) {
    if (!Animation.collect(this, 'multiplier', value) && (this._values[1] !== value)) {
      this._values[1] = value;
      this.onChange();
    }
  }

  resolve(value) {
    return this._values[0] + (this._values[1] * value);
  }

  /**
   * Parses a single value into a computational representation.
   *
   * Examples:
   * ```
   * SizeProperty.parse(10); // => `[10]`
   * SizeProperty.parse('10.5%'); // => `[0, 0.105]`
   * SizeProperty.parse('20%+10'); // => `[10, 0.2]`
   * SizeProperty.parse([20, 0.4]); // => `[20, 0.4]`
   * ```
   *
   * @param {Number|String|Array} value Number, string or array.
   */
  set(value) {
    if (typeof value === 'number') {
      this.constant = value;
      this.multiplier = 0;
      return;
    } else if (Array.isArray(value)) {
      this.constant = value[0];
      this.multiplier = value[1];
      return;
    } else if (!value) {
      return;
    }

    // must be string...
    const vals = value.match(/^(\d+(\.\d+)?)%([\+\-]\d+)?$/);
    if (vals) {
      const mul = parseFloat(vals[1]) / 100;
      this.multiplier = mul;
      if (vals[3]) {
        const px = parseInt(vals[vals.length - 1].substring(1));
        this.constant = (vals[3] === '-') ? -px : px;
      } else {
        this.constant = 0;
      }
    }
  }

  onChange() {
    // override to implement
  }
}
