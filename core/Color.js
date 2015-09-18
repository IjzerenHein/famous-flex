export default class Color {

  /**
   * Parses a color into a set of RGBA components.
   *
   * Examples:
   * ```
   * Color.parse('#FF00FF');
   * Color.parse('rgba(255,0,0,0.45)');
   * Color.parse('rgb(255,0,0)');
   * Color.parse([255, 255, 0, 0.5]);
   * ...
   * ```
   *
   * @param {String|Array} value String or array.
   * @return {Array}
   */
  static parse(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string') {
      if ((value[0] === '#') && (value.length === 7)) {
        return [
          parseInt(value.substring(1, 3), 16),
          parseInt(value.substring(3, 5), 16),
          parseInt(value.substring(5, 7), 16),
          1,
        ];
      } else if (value === 'transparent') {
        return [0, 0, 0, 0];
      } else {
        const rgba = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+))\)$/);
        if (rgba) {
          return [parseInt(rgba[0]), parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3])];
        } else {
          const rgb = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
          if (rgb) {
            return [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]), 1];
          }
        }
      }
    }
  }

  /**
   * Formats a color into an css-color (`rgba(r,g,b,t)`).
   *
   * Examples:
   * ```
   * Color.formatRGBA([255,0,255,0.5]); // => "rgba(255,0,255,0.5)"
   * Color.formatRGBA(color.parse('#00FF00')); // => "rgba(0,255,0,1)"
   * ```
   *
   * @param {Array} color RGBA components
   * @return {String}
   */
  static formatRGBA(color) {
    return 'rgba(' + Math.round(color[0]) + ',' + Math.round(color[1]) + ',' + Math.round(color[2]) + ',' + color[3] + ')';
  }
}
