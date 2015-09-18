import Color from '../core/Color';
import Animation from '../animation/Animation';

export default class Styles {
  constructor(el) {
    this._el = el;
    this._items = {};
  }

  setAll(styles) {
    if (styles) {
      for (var key in styles) {
        this._el.setProperty(key, styles[key]);
      }
    }
  }

  set(style, value) {
    this._el.setProperty(style, value);
  }

  get(style) {
    return this._items[style];
  }

  get color() {
    return this._items.color;
  }

  set color(color) {
    if (this._items.color && Animation.isCollecting) {
      Animation.collect(this, 'color', this._items.color, Color.parse(color));
    } else {
      this._items.color = Color.parse(color);
      this._el.setProperty('color', Array.isArray(color) ? Color.formatRGBA(color) : color);
    }
  }

  get backgroundColor() {
    return this._items.backgroundColor;
  }

  set backgroundColor(color) {
    if (this._items.backgroundColor && Animation.isCollecting) {
      Animation.collect(this, 'backgroundColor', this._items.backgroundColor, Color.parse(color));
    } else {
      this._items.backgroundColor = Color.parse(color);
      this._el.setProperty('backgroundColor', Array.isArray(color) ? Color.formatRGBA(color) : color);
    }
  }

  get borderColor() {
    return this._items.borderColor;
  }

  set borderColor(color) {
    if (this._items.borderColor && Animation.isCollecting) {
      Animation.collect(this, 'borderColor', this._items.borderColor, Color.parse(color));
    } else {
      this._items.borderColor = Color.parse(color);
      this._el.setProperty('borderColor', Array.isArray(color) ? Color.formatRGBA(color) : color);
    }
  }

  get borderRadius() {
    return this._items.borderRadius;
  }

  set borderRadius(value) {
    if (this._items.borderRadius && Animation.isCollecting) {
      Animation.collect(this, 'borderRadius', this._items.borderRadius || 0, value || 0);
    } else {
      this._items.borderColor = value;
      this._el.setProperty('borderRadius', (value === undefined) ? 'inherit' : (value + 'px'));
    }
  }
}
