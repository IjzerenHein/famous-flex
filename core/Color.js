import Animation from '../animation/Animation';
import CallbackStore from 'famous/utilities/CallbackStore';
import {interpolate} from '../utils';

export default class Color extends CallbackStore {
  constructor(node, color) {
    super();
    this._node = node;
    this._v = [0, 0, 0, 1];
    if (this.color) {
      this.set(color);
    }
  }

  /**
   * Gets the indiviual values of the color (red, green, blue, opacity)
   * as an array.
   *
   * @return {Array} Array of color components (e.g. `[255, 0, 255, 0.5]`).
   */
  get values() {
    return this._refColor ? this._refColor.get() : this._v;
  }

  set values(values) {
    this.setValues(values[0], values[1], values[2], values[3]);
  }

  /**
   * Sets of the individual color values.
   *
   * @param {Number} [r] Red color component (0..255).
   * @param {Number} [g] Green color component (0..255).
   * @param {Number} [b] Blue color component (0..255).
   * @param {Number} [a] Alpha (opacity) color component (0..1).
   * @return {Boolean} Returns true when color has changed
   */
  setValues(r, g, b, a) {
    if (this._init && Animation.isCollecting) {
      Animation.collect(this, 'values', this.values, [r, g, b, a]);
      return false;
    }
    let changed;
    if (this._refColor) {
      this._v[0] = this._refColor.red;
      this._v[1] = this._refColor.green;
      this._v[2] = this._refColor.blue;
      this._v[3] = this._refColor.opacity;
      this._refColor.off('changed', this._onRefChanged);
      this._refColor = undefined;
    }
    if ((r !== undefined) && (r !== this._v[0])) {
      this._v[0] = r;
      changed = true;
    }
    if ((g !== undefined) && (g !== this._v[1])) {
      this._v[1] = g;
      changed = true;
    }
    if ((b !== undefined) && (b !== this._v[2])) {
      this._v[2] = b;
      changed = true;
    }
    if ((a !== undefined) && (a !== this._v[3])) {
      this._v[3] = a;
      changed = true;
    }
    if (!this._init) {
      this._init = true;
      changed = true;
    }
    if (changed) {
      this.onChanged();
      return true;
    }
    return false;
  }

  /**
   * Sets of the contents of the color.
   *
   * The color provided can be either a another Color object, in which case
   * a reference to that color is created. Whenever the referenced color changes,
   * this color also changes. This effectively creates a "shallow" copy of the color.
   *
   * If an array of color values or a string (e.g. '#FF00FF', 'rgba(255, 0, 255, 0.5)')
   * is provided, a "deep" copy of the color is created.
   *
   * Examples:
   * ```
   * var color = new Color();
   * color.set('#FF00FF');
   * color.set('rgba(255,0,0,0.45)');
   * color.set('rgb(255,0,0)');
   * color.set([255, 255, 0, 0.5]);
   *
   * var color2 = new Color();
   * color2.set(color); // creates a reference (shallow copy) to 'color'
   * color2.set(color.get()); // creates a "deep" copy of 'color'
   * ```
   *
   * @param {Color|String|Array} color Color object, string or array.
   * @return {Boolean} Returns true when color has changed
   */
  set(color) {
    if (color instanceof Color) {
      this._onRefChanged = this._onRefChanged || () => this.onChanged();
      if (this._refColor !== color) {
        if (this._refColor) this._refColor.off('changed', this._onRefChanged);
        this._refColor = color;
        this._init = true;
        this._refColor.on('changed', this._onRefChanged);
        this.onChanged();
        return true;
      }
    } else if (Array.isArray(color)) {
      return this.setValues(color[0], color[1], color[2], color[3]);
    } else if (typeof color === 'string') {
      if ((color[0] === '#') && (color.length === 7)) {
        return this.setValues(
          parseInt(color.substring(1, 3), 16),
          parseInt(color.substring(3, 5), 16),
          parseInt(color.substring(5, 7), 16),
          1
        );
      } else if (color === 'transparent') {
        return this.setValues(0, 0, 0, 0);
      } else {
        const rgba = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+))\)$/);
        if (rgba) {
          return this.setValues(parseInt(rgba[0]), parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]));
        } else {
          const rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
          if (rgb) {
            return this.setValues(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]), 1);
          }
        }
      }
    }
    return false;
  }

  onChanged() {
    this._rgbaColor = undefined;
    this.trigger('changed');
  }

  get red() {
    return this._refColor ? this._refColor.red : this._v[0];
  }

  get green() {
    return this._refColor ? this._refColor.green : this._v[1];
  }

  get blue() {
    return this._refColor ? this._refColor.blue : this._v[2];
  }

  get opacity() {
    return this._refColor ? this._refColor.opacity : this._v[3];
  }

  set opacity(opacity) {
    this.setValues(this.red, this.green, this.blue, opacity);
  }

  /**
   * Formats a color into an css-color (`rgba(r,g,b,a)`).
   *
   * Examples:
   * ```
   * var color = new Color('#00FF00');
   * color.formatRGBA(); // => "rgba(0,255,0,1)"
   *
   * var color2 = new Color([255,0,255,0.5]);
   * color2.formatRGBA(); // => "rgba(255,0,255,0.5)"
   * ```
   *
   * @return {String} rgba string
   */
  formatRGBA() {
    if (this._refColor) {
      return this._refColor.formatRGBA();
    } else {
      this._rgbaColor = this._rgbaColor || 'rgba(' + Math.round(this._v[0]) + ',' + Math.round(this._v[1]) + ',' + Math.round(this._v[2]) + ',' + this._v[3] + ')';
      return this._rgbaColor;
    }
  }

  toString() {
    return this.formatRGBA();
  }

  interpolate(color1, color2, progress) {
    // TODO - optimize so that no intermediate arrays need to be created
    this.values = interpolate(color1.values, color2.values, progress);
  }
}
