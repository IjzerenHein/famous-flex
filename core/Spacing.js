import Padding from './Padding';

export default class Spacing {

  static resolve(spacing, rect, direction) {
    return spacing ? (spacing[direction][0] + (spacing[direction][1] * (direction ? rect.height : rect.width))) : 0;
  }

  /**
   * Parses a spacing value into a computational representation.
   *
   * Spacing can be specified in both short-hand and full form:
   * ```
   * Spacing.parse(8); // 8px spacing for all directions
   * Spacing.parse([8, 10]); // 8px spacing for horz, 10px for vert
   * Spacing.parse('10%'); // 10% spacing for all directions
   * Spacing.parse(['10%', '12%']); // 10% spacing for horz, 12% vert
   * ...
   * ```
   *
   * @param {String|Number|Array} value Number, string or array.
   * @return {Array}
   */
  static parse(value) {
    if (!value) {
      return Spacing.identity;
    } else if (!Array.isArray(value)) {
      const component = Padding.parseComponent(value);
      return [component, component];
    } else if (value.length === 0) {
      return Padding.identity;
    } else if (value.length === 1) {
      const component = Padding.parseComponent(value[0]);
      return [component, component];
    } else {
      return [Padding.parseComponent(value[0]), Padding.parseComponent(value[1])];
    }
  }
}

Spacing.identity = [[0, 0], [0, 0]];
