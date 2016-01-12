import Control from './Control';
import DOMNode from '../core/DOMNode';
import Label from './Label';
import Animation from '../animation/Animation';
import Color from '../core/Color';
import Theme from '../theme';
import Margins from '../core/Margins';

const defaults = {
  classes: ['button'],
  enabled: true,
  textAlign: 'center'
};

export default class Button extends Control {

  /**
   * @param {Object} options Configuration options.
   */
  constructor(options) {
    super();
    const onChange = () => this.requestLayout();
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    this._backgroundColor = new Color(this);
    this._backgroundColor.on('changed', onChange);
    this._borderColor = new Color(this);
    this._borderColor.on('changed', onChange);
    this._label = this.addChild(new Label());
    this._padding = new Margins();
    this._padding.onChange = onChange;
    /*this._image1 = this.addChild(new DOMNode({classes: ['image']}));
    this._image2 = this.addChild(new DOMNode({classes: ['image']}));*/
    this._setupClickListeners();
    this.setOptions(defaults, Theme.defaults.button, options);
  }

  _setupClickListeners() {
    this._background.on('pointer', (event) => {
      if (!this._activePointerId && event.status === 'start') {
        this._activePointerId = event.id;
        event.capture = true;
        this._setActive(true);
      }
      if (this._activePointerId === event.id) {
        if (event.status === 'end') {
          this._activePointerId = undefined;
          this._setActive(false);
          this.emit('click', {});
        }
      }
    });
  }

  _setActive(active) {
    if (this._active !== active) {
      this._active = active;
      this.classes.enable('active', active);
      this.requestLayout();
    }
  }

  get active() {
    return this._active;
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

  get padding() {
    return this._padding;
  }

  set padding(value) {
    this._padding.set(value);
  }

  get label() {
    return this._label;
  }

  set label(options) {
    this._label.setOptions(options);
  }

  get text() {
    return this._label.text;
  }

  set text(value) {
    this._label.text = value;
  }

  get textAlign() {
    return this._label.textAlign;
  }

  set textAlign(value) {
    this._label.textAlign = value;
  }

  get fontSize() {
    return this._label.fontSize;
  }

  set fontSize(value) {
    this._label.fontSize = value;
  }

  get color() {
    return this._label.color;
  }

  set color(color) {
    this._label.color = color;
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
        this._background.style.borderRadius = value;
      }
    }
  }
}
