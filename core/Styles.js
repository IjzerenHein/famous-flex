import Color from '../core/Color';
import Animation from '../animation/Animation';

// TODO - obtain these props through reflection?
const hasStyles = {
  color: true,
  backgroundColor: true,
  borderColor: true,
  textAlign: true,
  fontSize: true,
  borderRadius: true
};

export default class Styles {
  constructor(node) {
    this._node = node;
    this._items = {};
  }

  get(style) {
    return style ? this._items[style] : this._items;
  }

  set(style, value) {
    if (hasStyles[style]) {
      this[style] = value;
    } else {
      if (this._items[style] !== value) {
        this._items[style] = value;
        this._node.onSetStyle(style, value);
      }
    }
  }

  setOptions(options) {
    for (let key in options) {
      this.set(key, options[key]);
    }
  }

  get textAlign() {
    return this._items.textAlign;
  }

  set textAlign(value) {
    if (this._items.textAlign !== value) {
      this._items.textAlign = value;
      this._node.onSetStyle('textAlign', value);
    }
  }

  get fontSize() {
    return this._items.fontSize;
  }

  set fontSize(value) {
    if (this._items.fontSize !== value) {
      this._items.fontSize = value;
      this._node.onSetStyle('fontSize', value + 'px');
    }
  }

  setColor(style, color) {
    if (!this._items[style]) {
      this._items[style] = new Color();
      this._items[style].on('changed', () => this._node.onSetStyle(style, this._items[style].formatRGBA()));
    }
    this._items[style].set(color);
  }

  get color() {
    return this._items.color;
  }

  set color(color) {
    this.setColor('color', color);
  }

  get backgroundColor() {
    return this._items.backgroundColor;
  }

  set backgroundColor(color) {
    this.setColor('backgroundColor', color);
  }

  get borderColor() {
    return this._items.borderColor;
  }

  set borderColor(color) {
    this.setColor('borderColor', color);
  }

  get borderRadius() {
    return this._items.borderRadius;
  }

  set borderRadius(value) {
    if (this._items.borderRadius && Animation.isCollecting) {
      Animation.collect(this, 'borderRadius', this._items.borderRadius || 0, value || 0);
    } else {
      this._items.borderRadius = value;
      this._node.onSetStyle('borderRadius', (value === undefined) ? 'inherit' : (value + 'px'));
    }
  }
}
