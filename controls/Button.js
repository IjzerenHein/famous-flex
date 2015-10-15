import ControlBase from './ControlBase';
import DOMNode from '../core/DOMNode';
import ShowNode from '../core/ShowNode';
import Animation from '../animation/Animation';
import Color from '../core/Color';
import Theme from '../theme';

const defaults = {
  classes: ['button'],
  enabled: true,
  animated: false,
  textAlign: 'center'
};

export default class Button extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   */
  constructor(options) {
    super();
    this._background = this.addChild(new DOMNode({classes: ['background']}));
    /*this._image1 = this.addChild(new DOMNode({classes: ['image']}));
    this._image2 = this.addChild(new DOMNode({classes: ['image']}));*/
    this._color = new Color(this);
    this._color.on('changed', () => this.requestLayout());
    this._backgroundColor = new Color(this);
    this._backgroundColor.on('changed', () => this.requestLayout());
    this._borderColor = new Color(this);
    this._borderColor.on('changed', () => this.requestLayout());
    this.setOptions(defaults, Theme.defaults.button, options);
  }

  get text() {
    return this._text;
  }

  set text(value) {
    if (this._textValue !== value) {
      this._textValue = value;
      if (!this._text) {
        this._text = this.addChild(new ShowNode());
        this._text1 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
        this._text1.styles.set('textAlign', this._textAlign);
        this._activeText = this._text1;
        this._activeText.innerHTML = '<div>' + this._textValue + '</div>';
        this._text.show(this._activeText);
        return;
      }
      else if (this._text2) {
        this._text2 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
        this._text2.styles.set('textAlign', this._textAlign);
      }
      this._activeText = (this._activeText === this._text1) ? this._text2 : this._text1;
      this._activeText.innerHTML = this._textValue;
      this._text.show(this._activeText);
    }
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

  get textAlign() {
    return this._textAlign;
  }

  set textAlign(value) {
    if (this._textAlign !== value) {
      this._textAlign = value;
      if (this._text1) this._text1.styles.set('textAlign', value);
      if (this._text2) this._text2.styles.set('textAlign', value);
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
        this._background.styles.borderRadius = value;
      }
    }
  }
}
