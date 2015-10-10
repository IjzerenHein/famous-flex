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
        // TODO, CHECK IF KEY IS A PROPERTY
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
    if (!this._items.color) {
      this._items.color = new Color();
      this._items.color.on('changed', () => {
        this._el.setProperty('color', this._items.color.formatRGBA());
      });
    }
    this._items.color.set(color);
  }

  get backgroundColor() {
    return this._items.backgroundColor;
  }

  set backgroundColor(color) {
    if (!this._items.backgroundColor) {
      this._items.backgroundColor = new Color();
      this._items.backgroundColor.on('changed', () => {
        this._el.setProperty('backgroundColor', this._items.backgroundColor.formatRGBA());
      });
    }
    this._items.backgroundColor.set(color);
  }

  get borderColor() {
    return this._items.borderColor;
  }

  set borderColor(color) {
    if (!this._items.borderColor) {
      this._items.borderColor = new Color();
      this._items.borderColor.on('changed', () => {
        this._el.setProperty('borderColor', this._items.borderColor.formatRGBA());
      });
    }
    this._items.borderColor.set(color);
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
