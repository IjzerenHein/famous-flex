import Control from './Control';
import DOMNode from '../core/DOMNode';
import Animation from '../animation/Animation';
import Color from '../core/Color';
import Theme from '../theme';
import Margins from '../core/Margins';

const defaults = {
  classes: ['slider'],
  enabled: true,
  direction: 0,
  value: 0
};

export default class Slider extends Control {

  /**
   * @param {Object} options Configuration options.
   * @param {Bool} [options.checked] Checked state of the switch.
   */
  constructor(options) {
    super();
    this._handleDrag = {};
    this._handle = this.addChild(new DOMNode({classes: ['handle']}));
    this._setupDragListeners();
    this._inside = this.addChild(new DOMNode({classes: ['inside']}));
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    const onChange = () => this.requestLayout();
    this._color = new Color(this);
    this._color.on('changed', onChange);
    this._backgroundColor = new Color(this);
    this._backgroundColor.on('changed', onChange);
    this._borderColor = new Color(this);
    this._borderColor.on('changed', onChange);
    this._padding = new Margins();
    this._padding.onChange = onChange;
    this.setOptions(defaults, Theme.defaults.slider, options);
  }

  _setupDragListeners() {
    let startValue;
    this._handle.on('drag', (event) => {
      if (this._enabled) {
        if (event.status === 'start') startValue = this.value;
        this.value = Math.min(Math.max(0, startValue + (this._direction ? (event.delta.y / this.rect.height) : (event.delta.x / this.rect.width))), 1);
      }
    });
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (!Animation.collect(this, 'value', value)) {
      if (this._value !== value) {
        this._value = value;
        this.requestLayout();
      }
    }
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    if (this._direction !== value) {
      this._direction = value;
      this.requestLayout();
    }
  }

  get padding() {
    return this._padding;
  }

  set padding(value) {
    this._padding.set(value);
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;
      this.requestLayout();
    }
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color.set(color);
  }

  get backgroundColor() {
    return this._backgroundColor;
  }

  set backgroundColor(color) {
    this._backgroundColor.set(color);
  }

  get borderRadius() {
    return this._borderRadius;
  }

  set borderRadius(value) {
    if (this._borderRadius !== value) {
      this._borderRadius = value;
      if (value !== 'auto') {
        this._inner.style.borderRadius = value;
        this._background.style.borderRadius = value;
      }
    }
  }
}
