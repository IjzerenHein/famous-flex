
const ZERO_MARGINS = [0, 0, 0, 0];

export default class Margins {
  constructor(options) {
    this._inner = options ? Margins.normalize(options.inner) : ZERO_MARGINS;
    this._outer = options ? Margins.normalize(options.outer) : ZERO_MARGINS;
  }

  static outer(margins) {
    return margins ? margins.outer : ZERO_MARGINS;
  }

  static outerWidth(margins) {
    return margins ? (margins.outer[3] + margins.outer[1]) : 0;
  }

  static outerHeight(margins) {
    return margins ? (margins.outer[0] + margins.outer[2]) : 0;
  }

  static outerTop(margins) {
    return margins ? margins.outer[0] : 0;
  }

  static outerLeft(margins) {
    return margins ? margins.outer[3] : 0;
  }

  static inner(margins) {
    return margins ? margins.inner : ZERO_MARGINS;
  }

  static innerWidth(margins) {
    return margins ? (margins.inner[3] + margins.inner[1] + margins.outer[3] + margins.outer[1]) : 0;
  }

  static innerHeight(margins) {
    return margins ? (margins.inner[0] + margins.inner[2] + margins.outer[0] + margins.outer[2]) : 0;
  }

  static innerTop(margins) {
    return margins ? (margins.outer[0] + margins.inner[0]) : 0;
  }

  static innerLeft(margins) {
    return margins ? (margins.outer[3] + margins.inner[3]) : 0;
  }

  get inner() {
    return this._inner;
  }

  set inner(inner) {
    this._inner = Margins.normalize(inner);
  }

  get outer() {
    return this._outer;
  }

  set outer(outer) {
   this._outer = Margins.normalize(outer);
  }

  static normalize(margins) {
    if (!margins) {
      return ZERO_MARGINS;
    }
    else if (!Array.isArray(margins)) {
        return [margins, margins, margins, margins];
    }
    else if (margins.length === 0) {
        return ZERO_MARGINS;
    }
    else if (margins.length === 1) {
        return [margins[0], margins[0], margins[0], margins[0]];
    }
    else if (margins.length === 2) {
        return [margins[0], margins[1], margins[0], margins[1]];
    }
    else {
        return margins;
    }
  }
}
